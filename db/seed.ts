import { drizzle } from "drizzle-orm/mysql2";
import { exerciseLibrary } from "./schema";

const db = drizzle(process.env.DATABASE_URL!, { mode: "planetscale" });

const ejercicios = [
  // Pecho
  { nombre: "Press de Banca Plano", grupoMuscular: "pecho", equipo: "barra", dificultad: "intermedio" as const, descripcion: "Ejercicio fundamental para pecho", instrucciones: "Acostado en banca plana, agarra la barra con agarre medio. Baja controladamente al pecho y empuja hacia arriba." },
  { nombre: "Press Inclinado con Mancuernas", grupoMuscular: "pecho", equipo: "mancuernas", dificultad: "intermedio" as const, descripcion: "Enfocado en la parte superior del pecho", instrucciones: "En banca inclinada, press con mancuernas desde los hombros extendiendo los brazos." },
  { nombre: "Aperturas con Mancuernas", grupoMuscular: "pecho", equipo: "mancuernas", dificultad: "facil" as const, descripcion: "Aislamiento de pectorales", instrucciones: "Acostado, abre los brazos lateralmente con mancuernas y vuelve a juntarlas." },
  { nombre: "Fondos en Paralelas", grupoMuscular: "pecho", equipo: "peso_corporal", dificultad: "intermedio" as const, descripcion: "Ejercicio compuesto para pecho", instrucciones: "En paralelas, inclina el torso hacia adelante y baja hasta que los hombros esten al nivel de los codos." },
  { nombre: "Press de Banca con Mancuernas", grupoMuscular: "pecho", equipo: "mancuernas", dificultad: "facil" as const, descripcion: "Variante con mayor rango de movimiento", instrucciones: "Press en banca plana usando mancuernas en lugar de barra." },
  { nombre: "Cruces en Polea", grupoMuscular: "pecho", equipo: "cables", dificultad: "facil" as const, descripcion: "Aislamiento con tension constante", instrucciones: "De pie entre poleas, cruza los brazos al frente como abrazando un arbol." },
  { nombre: "Pullover con Mancuerna", grupoMuscular: "pecho", equipo: "mancuernas", dificultad: "intermedio" as const, descripcion: "Trabaja pecho y dorsal", instrucciones: "Acostado perpendicular en banca, baja la mancuerna detras de la cabeza y vuelve." },
  { nombre: "Flexiones (Push-ups)", grupoMuscular: "pecho", equipo: "peso_corporal", dificultad: "facil" as const, descripcion: "Ejercicio basico de peso corporal", instrucciones: "En posicion de plancha, baja el cuerpo hasta casi tocar el suelo y empuja hacia arriba." },

  // Espalda
  { nombre: "Peso Muerto", grupoMuscular: "espalda", equipo: "barra", dificultad: "avanzado" as const, descripcion: "Ejercicio rey para espalda", instrucciones: "Con barra en el suelo, levanta manteniendo espalda recta, empujando con piernas y caderas." },
  { nombre: "Jalon al Pecho", grupoMuscular: "espalda", equipo: "maquina", dificultad: "facil" as const, descripcion: "Ejercicio basico para dorsales", instrucciones: "Sentado en maquina, tira de la barra hacia la parte superior del pecho." },
  { nombre: "Remo con Barra", grupoMuscular: "espalda", equipo: "barra", dificultad: "intermedio" as const, descripcion: "Remo pendlay para espesor", instrucciones: "Con torso paralelo al suelo, rema la barra hacia el esternon." },
  { nombre: "Remo con Mancuerna", grupoMuscular: "espalda", equipo: "mancuernas", dificultad: "facil" as const, descripcion: "Remo unilateral", instrucciones: "Apoyado en banca, rema una mancuerna hacia la cadera." },
  { nombre: "Dominadas", grupoMuscular: "espalda", equipo: "peso_corporal", dificultad: "intermedio" as const, descripcion: "Ejercicio basico de peso corporal", instrucciones: "Colgado de barra, eleva el cuerpo hasta que la barbilla pase la barra." },
  { nombre: "Remo en Maquina", grupoMuscular: "espalda", equipo: "maquina", dificultad: "facil" as const, descripcion: "Remo sentado con soporte", instrucciones: "Sentado con pecho contra soporte, tira de las manijas hacia atras." },
  { nombre: "Pulldown con Agarre Cerrado", grupoMuscular: "espalda", equipo: "cables", dificultad: "facil" as const, descripcion: "Enfocado en dorsal ancho", instrucciones: "Usa barra en V, tira hacia abajo contra el pecho." },
  { nombre: "Hiperextensiones", grupoMuscular: "espalda", equipo: "maquina", dificultad: "facil" as const, descripcion: "Para zona lumbar", instrucciones: "En banca romana, baja el torso y eleva usando la lumbar." },

  // Hombros
  { nombre: "Press Militar", grupoMuscular: "hombros", equipo: "barra", dificultad: "intermedio" as const, descripcion: "Press de hombros de pie", instrucciones: "De pie, empuja la barra desde los hombres hasta extension completa." },
  { nombre: "Press con Mancuernas", grupoMuscular: "hombros", equipo: "mancuernas", dificultad: "facil" as const, descripcion: "Press de hombros sentado", instrucciones: "Sentado, press con mancuernas desde hombros hasta arriba." },
  { nombre: "Elevaciones Laterales", grupoMuscular: "hombros", equipo: "mancuernas", dificultad: "facil" as const, descripcion: "Aislamiento de deltoides laterales", instrucciones: "De pie, eleva mancuernas lateralmente hasta altura de hombros." },
  { nombre: "Elevaciones Frontales", grupoMuscular: "hombros", equipo: "mancuernas", dificultad: "facil" as const, descripcion: "Trabajo de deltoides anteriores", instrucciones: "Eleva mancuernas al frente hasta altura de hombros." },
  { nombre: "Pajaro (Face Pull)", grupoMuscular: "hombros", equipo: "cables", dificultad: "facil" as const, descripcion: "Para deltoides posteriores", instrucciones: "En polea alta, tira hacia la cara separando los codos." },
  { nombre: "Arnold Press", grupoMuscular: "hombros", equipo: "mancuernas", dificultad: "intermedio" as const, descripcion: "Variante rotacional del press", instrucciones: "Press con rotacion de palmas, de frente hacia afuera al subir." },

  // Biceps
  { nombre: "Curl con Barra", grupoMuscular: "biceps", equipo: "barra", dificultad: "facil" as const, descripcion: "Curl basico de biceps", instrucciones: "De pie, flexiona los codos elevando la barra." },
  { nombre: "Curl con Mancuernas", grupoMuscular: "biceps", equipo: "mancuernas", dificultad: "facil" as const, descripcion: "Curl alterno o simultaneo", instrucciones: "Flexiona los codos alternando brazos." },
  { nombre: "Curl Martillo", grupoMuscular: "biceps", equipo: "mancuernas", dificultad: "facil" as const, descripcion: "Trabaja braquial y braquiorradial", instrucciones: "Curl con agarre neutro (palmas hacia adentro)." },
  { nombre: "Curl Concentrado", grupoMuscular: "biceps", equipo: "mancuernas", dificultad: "facil" as const, descripcion: "Aislamiento maximo de biceps", instrucciones: "Sentado con el codo apoyado en el interior del muslo." },
  { nombre: "Curl en Predicador", grupoMuscular: "biceps", equipo: "barra", dificultad: "intermedio" as const, descripcion: "Curl con soporte para brazos", instrucciones: "En banca scott, curl con la parte posterior del brazo apoyada." },

  // Triceps
  { nombre: "Press Frances", grupoMuscular: "triceps", equipo: "barra", dificultad: "intermedio" as const, descripcion: "Extension de triceps acostado", instrucciones: "Acostado, baja la barra E-Z hacia la frente extendiendo despues." },
  { nombre: "Fondos en Banco", grupoMuscular: "triceps", equipo: "peso_corporal", dificultad: "facil" as const, descripcion: "Fondos para triceps", instrucciones: "Manos en banco detras, baja el cuerpo flexionando codos." },
  { nombre: "Extension con Soga", grupoMuscular: "triceps", equipo: "cables", dificultad: "facil" as const, descripcion: "Extension con cuerda en polea", instrucciones: "Tira de la soga hacia abajo separando los extremos al final." },
  { nombre: "Patada de Triceps", grupoMuscular: "triceps", equipo: "mancuernas", dificultad: "facil" as const, descripcion: "Extension unilateral", instrucciones: "Inclinado hacia adelante, extiende el brazo hacia atras." },
  { nombre: "Press Cerrado", grupoMuscular: "triceps", equipo: "barra", dificultad: "intermedio" as const, descripcion: "Press de pecho con agarre cerrado", instrucciones: "Press de banca con agarre a ancho de hombros, enfocado en triceps." },

  // Piernas - Cuadriceps
  { nombre: "Sentadilla", grupoMuscular: "cuadriceps", equipo: "barra", dificultad: "intermedio" as const, descripcion: "Ejercicio rey de piernas", instrucciones: "Con barra en espalda, baja flexionando rodillas y caderas hasta paralelo." },
  { nombre: "Prensa de Piernas", grupoMuscular: "cuadriceps", equipo: "maquina", dificultad: "facil" as const, descripcion: "Prensa inclinada", instrucciones: "En maquina, empuja la plataforma extendiendo las piernas." },
  { nombre: "Extension de Cuadriceps", grupoMuscular: "cuadriceps", equipo: "maquina", dificultad: "facil" as const, descripcion: "Aislamiento de cuadriceps", instrucciones: "Sentado, extiende las rodillas contra la resistencia." },
  { nombre: "Sentadilla Frontal", grupoMuscular: "cuadriceps", equipo: "barra", dificultad: "avanzado" as const, descripcion: "Sentadilla con barra al frente", instrucciones: "Con barra sobre los hombros al frente, realiza la sentadilla." },
  { nombre: "Zancadas", grupoMuscular: "cuadriceps", equipo: "mancuernas", dificultad: "facil" as const, descripcion: "Paso alterno hacia adelante", instrucciones: "Da un paso largo adelante bajando la rodilla trasera casi al suelo." },
  { nombre: "Hack Squat", grupoMuscular: "cuadriceps", equipo: "maquina", dificultad: "intermedio" as const, descripcion: "Sentadilla en maquina", instrucciones: "En maquina hack, realiza sentadilla con espalda apoyada." },
  { nombre: "Sentadilla Bulgara", grupoMuscular: "cuadriceps", equipo: "mancuernas", dificultad: "intermedio" as const, descripcion: "Sentadilla unilateral con pie trasero elevado", instrucciones: "Pie trasero en banca, baja en sentadilla unilateral." },

  // Piernas - Femoral/Gluteo
  { nombre: "Curl Femoral", grupoMuscular: "femoral", equipo: "maquina", dificultad: "facil" as const, descripcion: "Curl acostado o sentado", instrucciones: "Flexiona las rodillas llevando los talones hacia los gluteos." },
  { nombre: "Peso Muerto Rumano", grupoMuscular: "femoral", equipo: "barra", dificultad: "intermedio" as const, descripcion: "Peso muerto con piernas casi rectas", instrucciones: "Con piernas ligeramente flexionadas, inclina el torso hacia adelante." },
  { nombre: "Hip Thrust", grupoMuscular: "gluteos", equipo: "barra", dificultad: "intermedio" as const, descripcion: "Empuje de cadera para gluteos", instrucciones: "Con espalda en banca, empuja la barra hacia arriba con las caderas." },
  { nombre: "Patada de Gluteo", grupoMuscular: "gluteos", equipo: "cables", dificultad: "facil" as const, descripcion: "Extension de cadera en polea", instrucciones: "Con tobillo enganchado a polea baja, extiende la pierna hacia atras." },
  { nombre: "Puente de Gluteos", grupoMuscular: "gluteos", equipo: "peso_corporal", dificultad: "facil" as const, descripcion: "Elevacion de cadera en suelo", instrucciones: "Acostado boca arriba, eleva las caderas apretando gluteos." },
  { nombre: "Good Morning", grupoMuscular: "femoral", equipo: "barra", dificultad: "intermedio" as const, descripcion: "Inclinacion de torso con barra", instrucciones: "Con barra en espalda, inclina el torso hacia adelante manteniendo espalda recta." },
  { nombre: "Sentadilla Sumo", grupoMuscular: "femoral", equipo: "mancuernas", dificultad: "intermedio" as const, descripcion: "Sentadilla con piernas abiertas", instrucciones: "Con piernas muy abiertas y pies hacia afuera, realiza la sentadilla." },

  // Pantorrillas
  { nombre: "Elevacion de Talones de Pie", grupoMuscular: "pantorrilla", equipo: "maquina", dificultad: "facil" as const, descripcion: "Para gemelos de pie", instrucciones: "En maquina, eleva los talones subiendo sobre las puntas." },
  { nombre: "Elevacion de Talones Sentado", grupoMuscular: "pantorrilla", equipo: "maquina", dificultad: "facil" as const, descripcion: "Para soleo sentado", instrucciones: "En maquina sentado, eleva los talones." },
  { nombre: "Elevacion en Escalon", grupoMuscular: "pantorrilla", equipo: "peso_corporal", dificultad: "facil" as const, descripcion: "Con peso corporal o mancuernas", instrucciones: "De pie en escalon, eleva los talones bajando por debajo del nivel." },

  // Core/Abs
  { nombre: "Plancha", grupoMuscular: "abs", equipo: "peso_corporal", dificultad: "facil" as const, descripcion: "Isometrico para core", instrucciones: "Apoyado en antebrazos y puntas de pies, manten el cuerpo recto." },
  { nombre: "Crunch", grupoMuscular: "abs", equipo: "peso_corporal", dificultad: "facil" as const, descripcion: "Abdominal basico", instrucciones: "Acostado con rodillas flexionadas, eleva los hombros del suelo." },
  { nombre: "Elevacion de Piernas", grupoMuscular: "abs", equipo: "peso_corporal", dificultad: "intermedio" as const, descripcion: "Para parte inferior de abs", instrucciones: "Acostado, eleva las piernas rectas hasta 90 grados." },
  { nombre: "Russian Twist", grupoMuscular: "abs", equipo: "mancuernas", dificultad: "facil" as const, descripcion: "Rotacion de torso", instrucciones: "Sentado con torso inclinado, rota el torso de lado a lado." },
  { nombre: "Dragon Flag", grupoMuscular: "abs", equipo: "peso_corporal", dificultad: "avanzado" as const, descripcion: "Abdominal avanzado", instrucciones: "Acostado agarrando banca, eleva el cuerpo manteniendolo recto." },
  { nombre: "Mountain Climbers", grupoMuscular: "abs", equipo: "peso_corporal", dificultad: "facil" as const, descripcion: "Cardio y core", instrucciones: "En posicion de plancha, alterna llevando rodillas al pecho." },

  // Antebrazo
  { nombre: "Curl de Munecas", grupoMuscular: "antebrazo", equipo: "barra", dificultad: "facil" as const, descripcion: "Para flexores de muneca", instrucciones: "Sobre banco, flexiona las munecas hacia arriba." },
  { nombre: "Extension de Munecas", grupoMuscular: "antebrazo", equipo: "barra", dificultad: "facil" as const, descripcion: "Para extensores de muneca", instrucciones: "Sobre banco, extiende las munecas hacia arriba." },
  { nombre: "Farmer Walk", grupoMuscular: "antebrazo", equipo: "mancuernas", dificultad: "facil" as const, descripcion: "Caminata con peso", instrucciones: "Caminando con mancuernas pesadas, manten agarre firme." },

  // Trapecio
  { nombre: "Encogimientos con Barra", grupoMuscular: "trapecio", equipo: "barra", dificultad: "facil" as const, descripcion: "Para trapecio superior", instrucciones: "Con barra frente a los muslos, encoge los hombros hacia las orejas." },
  { nombre: "Encogimientos con Mancuernas", grupoMuscular: "trapecio", equipo: "mancuernas", dificultad: "facil" as const, descripcion: "Encogimiento unilateral o bilateral", instrucciones: "Con mancuernas a los lados, encoge los hombros." },
  { nombre: "Face Pull con Soga", grupoMuscular: "trapecio", equipo: "cables", dificultad: "facil" as const, descripcion: "Para trapecio medio y posterior", instrucciones: "Tira de la soga hacia la cara elevando los codos." },
];

async function seed() {
  console.log("Seeding exercise library...");
  for (const ej of ejercicios) {
    await db.insert(exerciseLibrary).values(ej);
  }
  console.log(`Seeded ${ejercicios.length} exercises`);
}

seed().catch(console.error);
