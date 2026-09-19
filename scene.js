import * as THREE from 'three';

/* ------------------------------------------------------------------ *
 *  BIOMA — vitrina de especímenes en WebGL
 *  Fauna de Costa Rica construida con primitivas, sin modelos externos.
 * ------------------------------------------------------------------ */

const PALETTE = {
  frogGreen: 0x6fa53f,
  frogGreenDark: 0x4d7f2c,
  frogBelly: 0xc9dc95,
  eyeRed: 0xe03a2f,
  flankBlue: 0x2547c4,
  toeOrange: 0xf0a02a,
  ink: 0x16241e,
  toucanChest: 0xf2d64b,
  beakGreen: 0x8bbf46,
  beakOrange: 0xe8762c,
  beakRed: 0xd0392b,
  slothFur: 0x9c8d74,
  slothFace: 0xd9cdb4,
  slothMask: 0x6b5b45,
  clawDark: 0x4a4038,
  hummerTeal: 0x1e7f6b,
  hummerThroat: 0xc8385a,
  morphoBlue: 0x3a5fe0,
  morphoEdge: 0xa3b8ff,
  bark: 0x6f5a45,
  leaf: 0x598b3a,
};

const surface = (color, extra = {}) =>
  new THREE.MeshStandardMaterial({
    color,
    flatShading: true,
    roughness: 0.62,
    metalness: 0.03,
    ...extra,
  });

/* Small helpers ---------------------------------------------------- */

function limb(material, radius, length) {
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 3, 8), material);
  return mesh;
}

function ball(material, radius, detail = 12) {
  return new THREE.Mesh(new THREE.SphereGeometry(radius, detail, Math.round(detail * 0.7)), material);
}

/* ------------------------------------------------------------------ *
 *  01 — Agalychnis callidryas (rana de ojos rojos)
 * ------------------------------------------------------------------ */

function buildFrog() {
  const group = new THREE.Group();
  const skin = surface(PALETTE.frogGreen);
  const belly = surface(PALETTE.frogBelly);
  const blue = surface(PALETTE.flankBlue);
  const orange = surface(PALETTE.toeOrange);
  const red = surface(PALETTE.eyeRed, { roughness: 0.42, flatShading: false });
  const black = surface(0x090d0b, { roughness: 0.95, metalness: 0 });

  const body = ball(skin, 1);
  body.scale.set(1.0, 0.8, 1.14);
  body.position.y = 0.16;
  group.add(body);

  const under = ball(belly, 0.86);
  under.scale.set(1.02, 0.5, 1.16);
  under.position.set(0, -0.16, 0.06);
  group.add(under);

  const head = ball(skin, 0.76);
  head.scale.set(1.08, 0.8, 1.02);
  head.position.set(0, 0.36, 1.02);
  group.add(head);

  const snout = ball(skin, 0.5);
  snout.scale.set(0.94, 0.66, 0.86);
  snout.position.set(0, 0.12, 1.42);
  group.add(snout);

  // Ojos: la firma de la especie. Van sobre la cabeza, mirando hacia afuera,
  // cada uno con su propio párpado para el parpadeo.
  const eyes = [];
  for (const side of [-1, 1]) {
    const socket = new THREE.Group();
    socket.position.set(side * 0.48, 0.74, 1.08);
    socket.rotation.y = side * 0.3;

    const globe = ball(red, 0.33, 16);
    socket.add(globe);

    // Adelantada hasta asomar por la esfera: dentro del globo no se vería.
    const pupil = ball(black, 0.24, 12);
    pupil.scale.set(0.36, 1.02, 0.36);
    pupil.position.set(0, 0, 0.29);
    socket.add(pupil);

    // El párpado solo existe durante el parpadeo; visible en reposo se leería
    // como un disco verde flotando sobre el ojo.
    const lid = ball(skin, 0.345, 16);
    lid.scale.y = 0.02;
    lid.position.y = 0.34;
    lid.visible = false;
    socket.add(lid);

    group.add(socket);
    eyes.push({ socket, lid });
  }

  // Flancos azul cobalto con barras crema
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.5, 0.22), blue);
      bar.position.set(side * 0.9, -0.04, 0.34 - i * 0.4);
      bar.rotation.z = side * 0.14;
      group.add(bar);
    }
  }

  // Extremidades. Las traseras plegadas, como en reposo sobre una hoja.
  const legs = [];
  const makeFoot = (parent, scale) => {
    const foot = new THREE.Group();
    for (let i = -1; i <= 1; i++) {
      const toe = limb(orange, 0.07 * scale, 0.3 * scale);
      toe.rotation.z = Math.PI / 2;
      toe.rotation.y = i * 0.5;
      toe.position.set(i * 0.1 * scale, 0, 0.16 * scale);
      const pad = ball(orange, 0.075 * scale, 8);
      pad.position.set(i * 0.19 * scale, 0, 0.31 * scale);
      foot.add(toe, pad);
    }
    parent.add(foot);
    return foot;
  };

  for (const side of [-1, 1]) {
    const front = new THREE.Group();
    front.position.set(side * 0.62, -0.42, 0.72);
    const upperArm = limb(skin, 0.14, 0.42);
    upperArm.rotation.z = side * 0.5;
    upperArm.position.set(side * 0.08, -0.16, 0);
    const foreArm = limb(skin, 0.12, 0.34);
    foreArm.rotation.x = 0.35;
    foreArm.position.set(side * 0.19, -0.5, 0.06);
    front.add(upperArm, foreArm);
    const hand = makeFoot(front, 1);
    hand.position.set(side * 0.24, -0.68, 0.06);
    group.add(front);
    legs.push(front);

    const back = new THREE.Group();
    back.position.set(side * 0.78, -0.2, -0.5);
    const thigh = limb(skin, 0.2, 0.5);
    thigh.rotation.z = Math.PI / 2;
    thigh.rotation.y = side * 0.55;
    const shin = limb(skin, 0.15, 0.52);
    shin.rotation.z = side * 0.7;
    shin.position.set(side * 0.36, -0.3, -0.12);
    back.add(thigh, shin);
    const foot = makeFoot(back, 1.25);
    foot.position.set(side * 0.62, -0.62, -0.1);
    foot.rotation.y = side * 0.4;
    group.add(back);
    legs.push(back);
  }

  // La hoja sobre la que descansa
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, -1.9);
  leafShape.bezierCurveTo(1.5, -1.1, 1.5, 1.1, 0, 2.1);
  leafShape.bezierCurveTo(-1.5, 1.1, -1.5, -1.1, 0, -1.9);
  const leaf = new THREE.Mesh(
    new THREE.ShapeGeometry(leafShape, 16),
    surface(PALETTE.leaf, { side: THREE.DoubleSide, flatShading: false, roughness: 0.8 }),
  );
  leaf.rotation.x = -Math.PI / 2;
  leaf.position.set(0, -1.12, 0);
  leaf.scale.setScalar(1.15);
  leaf.receiveShadow = true;
  group.add(leaf);

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 2.4, 6), surface(PALETTE.bark));
  stem.rotation.z = Math.PI / 2;
  stem.position.set(-1.9, -1.14, 0);
  group.add(stem);

  let blinkAt = 2.4;
  return {
    group,
    frame: { y: -0.1, distance: 6.4 },
    update(t, dt) {
      const breath = Math.sin(t * 1.6) * 0.028;
      body.scale.y = 0.8 + breath;
      head.position.y = 0.36 + breath * 0.6;
      snout.position.y = 0.12 + breath * 0.5;

      // Parpadeo esporádico: el párpado baja y sube rápido.
      blinkAt -= dt;
      if (blinkAt < 0) blinkAt = 2.2 + Math.random() * 3.4;
      const phase = Math.max(0, 0.16 - blinkAt) / 0.16;
      const shut = phase > 0 ? Math.sin(phase * Math.PI) : 0;
      for (const eye of eyes) {
        eye.lid.visible = shut > 0.02;
        eye.lid.scale.y = 0.02 + shut * 1.0;
        eye.lid.position.y = 0.34 - shut * 0.34;
      }
      group.position.y = Math.sin(t * 0.9) * 0.04;
    },
  };
}

/* ------------------------------------------------------------------ *
 *  02 — Ramphastos sulfuratus (tucán pico iris)
 * ------------------------------------------------------------------ */

function buildToucan() {
  const group = new THREE.Group();
  const feather = surface(PALETTE.ink, { roughness: 0.7 });
  const chestMat = surface(PALETTE.toucanChest);

  const perch = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 4.6, 7), surface(PALETTE.bark));
  perch.rotation.z = Math.PI / 2;
  perch.rotation.y = 0.12;
  perch.position.set(0, -1.5, 0);
  perch.receiveShadow = true;
  group.add(perch);

  const bird = new THREE.Group();
  bird.position.y = 0.1;
  group.add(bird);

  const body = ball(feather, 1);
  body.scale.set(0.86, 1.02, 1.0);
  bird.add(body);

  const chest = ball(chestMat, 0.74);
  chest.scale.set(0.86, 1.0, 0.8);
  chest.position.set(0, 0.24, 0.48);
  bird.add(chest);

  const head = new THREE.Group();
  head.position.set(0, 1.06, 0.18);
  bird.add(head);

  const skull = ball(feather, 0.6);
  skull.scale.set(0.94, 0.96, 1.0);
  head.add(skull);

  const cheek = ball(chestMat, 0.5);
  cheek.scale.set(0.82, 0.7, 0.7);
  cheek.position.set(0, -0.08, 0.3);
  head.add(cheek);

  // El pico: tres tramos de color, ligeramente curvado hacia abajo.
  const beak = new THREE.Group();
  beak.position.set(0, -0.02, 0.5);
  head.add(beak);
  const segments = [
    { mat: PALETTE.beakGreen, r1: 0.34, r2: 0.29, len: 0.7, z: 0.35, drop: 0.0 },
    { mat: PALETTE.beakOrange, r1: 0.29, r2: 0.2, len: 0.62, z: 0.99, drop: -0.06 },
    { mat: PALETTE.beakRed, r1: 0.2, r2: 0.03, len: 0.5, z: 1.5, drop: -0.17 },
  ];
  for (const s of segments) {
    const piece = new THREE.Mesh(new THREE.CylinderGeometry(s.r2, s.r1, s.len, 10), surface(s.mat));
    piece.rotation.x = Math.PI / 2;
    piece.position.set(0, s.drop, s.z);
    beak.add(piece);
  }
  // Sigue la caída del pico; si va recta se sale por la punta roja.
  const beakLine = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.035, 1.42), surface(PALETTE.ink));
  beakLine.position.set(0, -0.04, 0.74);
  beakLine.rotation.x = 0.12;
  beak.add(beakLine);

  for (const side of [-1, 1]) {
    const eye = ball(surface(0xf6f3e9, { roughness: 0.3 }), 0.16, 10);
    eye.position.set(side * 0.38, 0.14, 0.36);
    head.add(eye);
    const pupil = ball(surface(PALETTE.ink, { roughness: 0.2 }), 0.09, 8);
    pupil.position.set(side * 0.42, 0.14, 0.47);
    head.add(pupil);

    const wing = ball(feather, 0.62);
    wing.scale.set(0.28, 0.92, 0.78);
    wing.position.set(side * 0.78, 0.06, -0.04);
    bird.add(wing);

    const leg = limb(surface(PALETTE.flankBlue), 0.09, 0.5);
    leg.position.set(side * 0.26, -1.16, 0.06);
    bird.add(leg);
    const claw = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.06, 5, 10, Math.PI), surface(PALETTE.flankBlue));
    claw.rotation.y = Math.PI / 2;
    claw.position.set(side * 0.26, -1.5, 0.06);
    bird.add(claw);
  }

  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.5, 0.22), feather);
  tail.position.set(0, -0.6, -0.86);
  tail.rotation.x = 0.42;
  bird.add(tail);
  const tailTip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.2), surface(PALETTE.eyeRed));
  tailTip.position.set(0, -1.24, -1.14);
  tailTip.rotation.x = 0.42;
  bird.add(tailTip);

  return {
    group,
    frame: { y: 0.05, distance: 7.2 },
    update(t) {
      // El tucán mira alrededor: giros cortos, pausas largas.
      const look = Math.sin(t * 0.55) * 0.5 + Math.sin(t * 0.23) * 0.35;
      head.rotation.y = look;
      head.rotation.z = Math.sin(t * 0.7) * 0.05;
      bird.position.y = 0.1 + Math.sin(t * 1.3) * 0.05;
      bird.rotation.z = Math.sin(t * 0.6) * 0.03;
      tail.rotation.x = 0.42 + Math.sin(t * 1.3 + 0.6) * 0.06;
    },
  };
}

/* ------------------------------------------------------------------ *
 *  03 — Bradypus variegatus (perezoso de tres dedos)
 * ------------------------------------------------------------------ */

function buildSloth() {
  const group = new THREE.Group();
  const fur = surface(PALETTE.slothFur, { roughness: 0.9 });
  const faceMat = surface(PALETTE.slothFace, { roughness: 0.85 });
  const mask = surface(PALETTE.slothMask, { roughness: 0.85 });
  const claw = surface(PALETTE.clawDark, { roughness: 0.5 });

  const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 5.2, 8), surface(PALETTE.bark));
  branch.rotation.z = Math.PI / 2;
  branch.rotation.x = 0.05;
  branch.position.y = 1.85;
  branch.castShadow = true;
  group.add(branch);

  const hanging = new THREE.Group();
  hanging.position.y = 0.55;
  group.add(hanging);

  const body = ball(fur, 1);
  body.scale.set(0.9, 1.02, 0.86);
  hanging.add(body);

  const head = new THREE.Group();
  head.position.set(0, 0.98, 0.16);
  hanging.add(head);

  const skull = ball(fur, 0.62);
  skull.scale.set(1.0, 0.94, 0.94);
  head.add(skull);

  const face = ball(faceMat, 0.5);
  face.scale.set(0.86, 0.88, 0.6);
  face.position.set(0, -0.02, 0.36);
  head.add(face);

  // Antifaz oscuro y la sonrisa permanente de la especie
  for (const side of [-1, 1]) {
    const patch = ball(mask, 0.2, 10);
    patch.scale.set(1.5, 0.62, 0.34);
    patch.position.set(side * 0.24, 0.08, 0.6);
    patch.rotation.z = side * -0.32;
    head.add(patch);

    const eye = ball(surface(PALETTE.ink, { roughness: 0.25 }), 0.08, 8);
    eye.position.set(side * 0.21, 0.06, 0.7);
    head.add(eye);
  }
  const nose = ball(surface(PALETTE.clawDark, { roughness: 0.4 }), 0.11, 10);
  nose.scale.set(1.3, 0.8, 0.8);
  nose.position.set(0, -0.24, 0.68);
  head.add(nose);
  const smile = ball(surface(PALETTE.clawDark, { roughness: 0.7 }), 0.16, 10);
  smile.scale.set(1.5, 0.16, 0.3);
  smile.position.set(0, -0.37, 0.66);
  head.add(smile);

  // Brazos largos enganchados a la rama: la postura que define al animal.
  const arms = [];
  for (const side of [-1, 1]) {
    for (const front of [0.42, -0.42]) {
      const arm = new THREE.Group();
      arm.position.set(side * 0.62, 0.42, front);
      const upper = limb(fur, 0.17, 0.72);
      upper.rotation.z = side * 0.42;
      upper.position.set(side * 0.16, 0.42, 0);
      const lower = limb(fur, 0.15, 0.66);
      lower.rotation.z = side * 0.16;
      lower.position.set(side * 0.34, 1.0, 0);
      arm.add(upper, lower);
      for (let i = -1; i <= 1; i++) {
        const nail = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.055, 5, 10, Math.PI * 1.1), claw);
        nail.rotation.y = Math.PI / 2;
        nail.rotation.z = -0.5;
        nail.position.set(side * 0.4, 1.34, i * 0.13);
        arm.add(nail);
      }
      hanging.add(arm);
      arms.push(arm);
    }
  }

  return {
    group,
    frame: { y: 1.05, distance: 7.9 },
    update(t) {
      // Todo muy lento: es el punto del animal.
      const sway = Math.sin(t * 0.42) * 0.05;
      hanging.rotation.z = sway;
      hanging.position.y = 0.55 + Math.sin(t * 0.42) * 0.03;
      head.rotation.y = Math.sin(t * 0.28) * 0.34;
      head.rotation.x = Math.sin(t * 0.2) * 0.1;
      body.scale.y = 1.02 + Math.sin(t * 0.8) * 0.015;
    },
  };
}

/* ------------------------------------------------------------------ *
 *  04 — Amazilia tzacatl (colibrí rabirrufo)
 * ------------------------------------------------------------------ */

function buildHummingbird() {
  const group = new THREE.Group();
  const plume = surface(PALETTE.hummerTeal, { roughness: 0.35, metalness: 0.35 });
  const throat = surface(PALETTE.hummerThroat, { roughness: 0.3, metalness: 0.3 });
  const wingMat = surface(0x3b4f66, {
    roughness: 0.4,
    transparent: true,
    opacity: 0.62,
    side: THREE.DoubleSide,
    flatShading: false,
  });

  // De frente el pico apunta a la cámara y desaparece: se presenta girado,
  // encarando la flor.
  const bird = new THREE.Group();
  bird.position.y = 0.6;
  bird.rotation.y = 1.12;
  group.add(bird);

  const body = ball(plume, 0.6);
  body.scale.set(0.86, 0.9, 1.25);
  bird.add(body);

  const head = ball(plume, 0.4);
  head.position.set(0, 0.34, 0.5);
  bird.add(head);

  const gorget = ball(throat, 0.25);
  gorget.scale.set(0.9, 0.78, 0.62);
  gorget.position.set(0, 0.14, 0.7);
  bird.add(gorget);

  const beak = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.06, 1.15, 7), surface(PALETTE.ink));
  beak.rotation.x = Math.PI / 2 - 0.14;
  beak.position.set(0, 0.42, 1.28);
  bird.add(beak);

  for (const side of [-1, 1]) {
    const eye = ball(surface(PALETTE.ink, { roughness: 0.2 }), 0.075, 8);
    eye.position.set(side * 0.27, 0.42, 0.72);
    bird.add(eye);
  }

  // Rufa, como dice el nombre común, y pegada al cuerpo: separada leía como ramita.
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.13, 0.8), surface(0xa8632f, { roughness: 0.55 }));
  tail.position.set(0, -0.06, -0.76);
  tail.rotation.x = -0.16;
  bird.add(tail);

  // Alas: perfil real recortado con una curva, no un rectángulo.
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.bezierCurveTo(0.5, 0.42, 1.5, 0.5, 2.1, 0.06);
  wingShape.bezierCurveTo(1.5, -0.12, 0.6, -0.3, 0, 0);
  const wings = [];
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.34, 0.24, 0.06);
    pivot.scale.setScalar(0.8);
    const wing = new THREE.Mesh(new THREE.ShapeGeometry(wingShape, 14), wingMat);
    wing.scale.x = side;
    pivot.add(wing);
    bird.add(pivot);
    wings.push({ pivot, side });
  }

  // A la altura del pico: si queda abajo, el ave parece picotear el aire.
  const flower = new THREE.Group();
  flower.position.set(1.72, 0.62, 0.78);
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 3.4, 6), surface(PALETTE.leaf));
  stalk.position.y = -1.7;
  flower.add(stalk);
  for (let i = 0; i < 6; i++) {
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), surface(PALETTE.eyeRed));
    petal.scale.set(0.34, 0.16, 0.7);
    petal.position.set(Math.cos((i / 6) * Math.PI * 2) * 0.3, 0.1, Math.sin((i / 6) * Math.PI * 2) * 0.3);
    petal.lookAt(0, 0.6, 0);
    flower.add(petal);
  }
  const pistil = ball(surface(PALETTE.toeOrange), 0.14, 8);
  pistil.position.y = 0.16;
  flower.add(pistil);
  group.add(flower);

  return {
    group,
    frame: { y: 0.3, distance: 7.5 },
    update(t) {
      // ~50 batidos por segundo son un borrón; se sugiere, no se simula.
      const beat = Math.sin(t * 34);
      for (const w of wings) {
        w.pivot.rotation.z = beat * 0.85;
        w.pivot.rotation.y = w.side * (0.35 + beat * 0.22);
      }
      bird.position.y = 0.6 + Math.sin(t * 3.1) * 0.07;
      bird.position.x = Math.sin(t * 0.8) * 0.12;
      bird.rotation.y = 1.12 + Math.sin(t * 0.8) * 0.09;
      bird.rotation.z = Math.sin(t * 0.8) * 0.06;
      bird.rotation.x = 0.06 + Math.sin(t * 1.7) * 0.05;
    },
  };
}

/* ------------------------------------------------------------------ *
 *  05 — Morpho peleides (mariposa morfo azul)
 * ------------------------------------------------------------------ */

function buildMorpho() {
  const group = new THREE.Group();
  const bodyMat = surface(PALETTE.ink, { roughness: 0.6 });
  const upper = surface(PALETTE.morphoBlue, {
    roughness: 0.24,
    metalness: 0.5,
    side: THREE.DoubleSide,
    flatShading: false,
  });
  const rim = surface(PALETTE.morphoEdge, {
    roughness: 0.3,
    metalness: 0.4,
    side: THREE.DoubleSide,
    flatShading: false,
  });

  // La pose viva se define aquí y no solo en update: el primer fotograma
  // (o una pestaña en segundo plano) mostraría la mariposa aplanada.
  const butterfly = new THREE.Group();
  butterfly.position.y = 0.7;
  butterfly.scale.setScalar(0.92);
  butterfly.rotation.set(0.34, -0.42, 0);
  group.add(butterfly);

  const thorax = limb(bodyMat, 0.12, 0.9);
  thorax.rotation.x = Math.PI / 2;
  butterfly.add(thorax);
  const headBall = ball(bodyMat, 0.14, 8);
  headBall.position.z = 0.6;
  butterfly.add(headBall);
  for (const side of [-1, 1]) {
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.018, 0.5, 5), bodyMat);
    antenna.position.set(side * 0.09, 0.2, 0.78);
    antenna.rotation.x = -0.62;
    antenna.rotation.z = side * 0.42;
    butterfly.add(antenna);
  }

  // Ala anterior: borde de ataque recto y ápice en punta. Posterior: lobulada.
  const foreShape = new THREE.Shape();
  foreShape.moveTo(0, 0);
  foreShape.bezierCurveTo(0.18, 1.0, 0.95, 1.52, 1.98, 1.12);
  foreShape.bezierCurveTo(2.16, 0.72, 1.62, 0.18, 0.86, -0.04);
  foreShape.bezierCurveTo(0.52, -0.1, 0.2, -0.08, 0, 0);

  const hindShape = new THREE.Shape();
  hindShape.moveTo(0, 0);
  hindShape.bezierCurveTo(0.92, 0.04, 1.56, -0.34, 1.5, -1.04);
  hindShape.bezierCurveTo(1.44, -1.58, 0.86, -1.84, 0.46, -1.34);
  hindShape.bezierCurveTo(0.22, -0.94, 0.1, -0.4, 0, 0);

  const wings = [];
  for (const side of [-1, 1]) {
    // El ala queda horizontal (half gira -90° en x), así que el aleteo es un
    // giro sobre z. Sobre y solo barrería adelante y atrás, siempre plana.
    const pivot = new THREE.Group();
    pivot.position.set(0, 0.06, 0.1);
    pivot.rotation.z = side * 0.62;

    const fore = new THREE.Mesh(new THREE.ShapeGeometry(foreShape, 18), upper);
    const foreRim = new THREE.Mesh(new THREE.ShapeGeometry(foreShape, 18), rim);
    foreRim.scale.setScalar(1.06);
    foreRim.position.z = -0.012;
    const hind = new THREE.Mesh(new THREE.ShapeGeometry(hindShape, 18), upper);
    hind.position.z = -0.02;

    const half = new THREE.Group();
    half.add(foreRim, fore, hind);
    half.scale.x = side;
    half.rotation.x = -Math.PI / 2;
    pivot.add(half);
    butterfly.add(pivot);
    wings.push({ pivot, side });
  }

  return {
    group,
    frame: { y: 0.5, camY: 3.0, distance: 6.8 },
    update(t) {
      // Nunca llegan a plano: un morfo en vuelo mantiene las alas en V.
      const flap = (Math.sin(t * 2.6) + 1) * 0.5;
      for (const w of wings) {
        w.pivot.rotation.z = w.side * (0.22 + flap * 0.82);
      }
      butterfly.position.y = 0.7 + Math.sin(t * 1.2) * 0.22;
      butterfly.position.x = Math.sin(t * 0.52) * 0.35;
      butterfly.rotation.z = Math.sin(t * 0.52) * 0.14;
      butterfly.rotation.x = 0.34 + Math.sin(t * 1.2) * 0.1;
      butterfly.rotation.y = -0.42 + Math.sin(t * 0.52) * 0.12;
    },
  };
}

/* ------------------------------------------------------------------ *
 *  Vitrina
 * ------------------------------------------------------------------ */

const BUILDERS = {
  rana: buildFrog,
  tucan: buildToucan,
  perezoso: buildSloth,
  colibri: buildHummingbird,
  morpho: buildMorpho,
};

const canvas = document.getElementById('vitrina');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
camera.position.set(0, 0.6, 7);

const key = new THREE.DirectionalLight(0xfff6e2, 2.1);
key.position.set(3.4, 5.6, 4.2);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
key.shadow.camera.near = 1;
key.shadow.camera.far = 22;
key.shadow.camera.left = -6;
key.shadow.camera.right = 6;
key.shadow.camera.top = 6;
key.shadow.camera.bottom = -6;
key.shadow.bias = -0.0018;
scene.add(key);

const rim = new THREE.DirectionalLight(0x9fc0ff, 0.85);
rim.position.set(-4.2, 1.6, -3.4);
scene.add(rim);

const ambient = new THREE.HemisphereLight(0xdfe8ef, 0x6b7a58, 0.75);
scene.add(ambient);

const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.16 }));
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.5;
floor.receiveShadow = true;
scene.add(floor);

const stage = new THREE.Group();
scene.add(stage);

let current = null;
let currentKey = null;
let entering = 0;

function castAll(root) {
  root.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
}

function show(name) {
  if (name === currentKey || !BUILDERS[name]) return;
  currentKey = name;

  if (current) {
    stage.remove(current.group);
    current.group.traverse((node) => {
      if (node.isMesh) {
        node.geometry.dispose();
        if (Array.isArray(node.material)) node.material.forEach((m) => m.dispose());
        else node.material.dispose();
      }
    });
  }

  current = BUILDERS[name]();
  castAll(current.group);
  stage.add(current.group);
  camera.position.set(0, current.frame.camY ?? 0.6, current.frame.distance);
  camera.lookAt(0, current.frame.y, 0);
  entering = reduced.matches ? 1 : 0;
  if (entering === 0) {
    stage.scale.setScalar(0.72);
    stage.position.y = -0.5;
  }

  // Pintar ya: si la pestaña está en segundo plano requestAnimationFrame
  // no corre y el lienzo se quedaría con el espécimen anterior.
  renderer.render(scene, camera);

  document.querySelectorAll('[data-specimen]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.specimen === name));
  });
  const plate = document.getElementById('plate-caption');
  const source = document.querySelector(`[data-specimen="${name}"]`);
  if (plate && source) {
    plate.querySelector('[data-field="binomial"]').textContent = source.dataset.binomial;
    plate.querySelector('[data-field="common"]').textContent = source.dataset.common;
    plate.querySelector('[data-field="note"]').textContent = source.dataset.note;
  }
}

/* Órbita con el puntero: arrastre para girar, reposo para volver al centro */
let dragging = false;
let pointerX = 0;
let targetYaw = 0;
let targetPitch = 0;
let yaw = 0;
let pitch = 0;
let idleYaw = 0;

canvas.addEventListener('pointerdown', (e) => {
  dragging = true;
  pointerX = e.clientX;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointerup', (e) => {
  dragging = false;
  canvas.releasePointerCapture(e.pointerId);
});
canvas.addEventListener('pointerleave', () => {
  // Sin esto el espécimen se queda inclinado donde quedó el puntero.
  targetPitch = 0;
  idleYaw = 0;
});
canvas.addEventListener('pointermove', (e) => {
  if (dragging) {
    targetYaw += (e.clientX - pointerX) * 0.008;
    pointerX = e.clientX;
  } else {
    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    targetPitch = -ny * 0.28;
    idleYaw = nx * 0.4;
  }
});

function resize() {
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(1, rect.width);
  const h = Math.max(1, rect.height);
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas);
resize();

const clock = new THREE.Clock();
let running = true;
document.addEventListener('visibilitychange', () => {
  running = !document.hidden;
  if (running) clock.getDelta();
  else renderer.render(scene, camera);
});

function tick() {
  requestAnimationFrame(tick);
  if (!running) return;

  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  if (current) {
    if (!reduced.matches) current.update(t, dt);

    if (entering < 1) {
      entering = Math.min(1, entering + dt * 1.6);
      const ease = 1 - Math.pow(1 - entering, 3);
      stage.scale.setScalar(0.72 + ease * 0.28);
      stage.position.y = (1 - ease) * -0.5;
    }

    const drift = reduced.matches ? 0 : Math.sin(t * 0.22) * 0.28;
    targetYaw += dragging ? 0 : 0;
    yaw += (targetYaw + idleYaw + drift - yaw) * Math.min(1, dt * 4);
    pitch += (targetPitch - pitch) * Math.min(1, dt * 4);
    stage.rotation.y = yaw;
    stage.rotation.x = pitch;
  }

  renderer.render(scene, camera);
}

/* La vitrina se enciende con el espécimen que la página anuncia primero */
document.querySelectorAll('[data-specimen]').forEach((btn) => {
  btn.addEventListener('click', () => show(btn.dataset.specimen));
});
show('rana');
tick();

/* Revelado al hacer scroll, con red de seguridad si el observer no dispara */
const revealables = document.querySelectorAll('.reveal');
if (reduced.matches) {
  revealables.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  revealables.forEach((el) => io.observe(el));
  setTimeout(() => revealables.forEach((el) => el.classList.add('is-in')), 2000);
}
