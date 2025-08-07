
export type MeditationCue = {
  time: number; // Time in seconds when the cue should be read
  text: string;
};

export type TimedMeditationScript = {
  title: string;
  duration: number; // Total duration in seconds
  cues: MeditationCue[];
  isCustom?: boolean;
  isTimerOnly?: boolean;
};

type LanguageScripts = {
  [key: string]: TimedMeditationScript[];
}

export const scripts: LanguageScripts = {
  en: [
    {
      title: 'Mindful Breathing',
      duration: 300, // 5 minutes
      cues: [
        {
          time: 0,
          text: `Find a comfortable position, either sitting on a chair with your feet flat on the floor, or on a cushion on the floor. Allow your back to be straight but not stiff. Gently close your eyes. Bring your attention to your breath. Notice the sensation of the air entering your nostrils, filling your lungs, and then leaving your body. Don't try to change your breathing in any way. Simply observe it.`,
        },
        {
          time: 120,
          text: `As you breathe, you may notice your mind wandering. This is completely normal. When you realize your mind has wandered, gently and without judgment, guide your attention back to your breath. Feel the gentle rise and fall of your chest or abdomen with each inhale and exhale.`,
        },
        {
          time: 270,
          text: `You are in the final moments of this session. Continue to rest your awareness on the simple, natural rhythm of your breath. When you're ready, slowly begin to bring your awareness back to the room. Wiggle your fingers and toes. And when you feel ready, gently open your eyes.`,
        },
      ],
    },
    {
      title: '15-Minute Body Scan',
      duration: 900, // 15 minutes
      cues: [
        {
          time: 0,
          text: `Let's begin the Body Scan. Find a comfortable position, lying on your back if possible, with your arms by your sides and your legs uncrossed. Close your eyes gently and take a few deep breaths to settle in.`,
        },
        {
          time: 60,
          text: `Bring your awareness to the toes of your left foot. Notice any sensations you feel there - perhaps warmth, coolness, or tingling. Slowly, expand your awareness to include your entire left foot, ankle, and calf.`,
        },
        {
          time: 180, // 3 minute mark
          text: `Now, move your attention up to your left knee and thigh. Be aware of any and all sensations without judgment. Now, shift your focus to your right foot, and begin scanning upwards through the right leg, just as you did with the left.`,
        },
        {
          time: 300, // 5 minute mark
          text: `Bring your awareness now to your pelvis and abdomen. Notice the gentle rise and fall with each breath. Let go of any tension you might be holding here.`,
        },
        {
          time: 480, // 8 minute mark
          text: `Move your focus up into your chest and shoulders. Feel the weight of your body sinking into the surface beneath you. Scan your awareness down your arms to your fingertips, noticing any sensations along the way.`,
        },
        {
          time: 660, // 11 minute mark
          text: `Gently bring your attention to your neck and face. Soften your jaw, your cheeks, and the small muscles around your eyes. Let your forehead be smooth and relaxed.`,
        },
        {
          time: 840, // 14 minute mark
          text: `Now, for the final minute, expand your awareness to encompass your entire body, from the top of your head to the tips of your toes. Feel the breath moving through you, a gentle wave of energy. Rest in this state of wholeness.`,
        },
        {
          time: 890,
          text: `Our session is coming to an end. Slowly begin to bring your awareness back to the room. Wiggle your fingers and toes. When you feel ready, gently open your eyes.`,
        },
      ],
    },
    {
      title: 'Loving-Kindness',
      duration: 600, // 10 minutes
      cues: [
        {
          time: 0,
          text: `Sit in a comfortable and relaxed position. Close your eyes and take a few deep breaths. Bring to mind a feeling of warmth and kindness. We'll start by offering this kindness to yourself. Silently repeat: May I be happy. May I be healthy. May I be safe.`,
        },
        {
          time: 180,
          text: `Now, bring to mind a loved one. Picture them clearly. Direct your feelings of loving-kindness towards them, repeating: May you be happy. May you be healthy. May you be safe.`,
        },
        {
          time: 360,
          text: `Next, think of a neutral person. Someone you see but don't know well. Offer the same phrases of loving-kindness to them.`,
        },
        {
          time: 540,
          text: `Finally, expand your awareness to include all living beings everywhere. Extend your loving-kindness to everyone: May all beings be happy. May all beings be healthy. May all beings be safe. When you're ready, slowly open your eyes.`,
        },
      ],
    },
    {
      title: 'Gratitude Meditation',
      duration: 360, // 6 minutes
      cues: [
        { time: 0, text: 'Find a comfortable position and gently close your eyes.' },
        { time: 10, text: 'Take a few slow, deep breaths to settle into this moment.' },
        { time: 25, text: 'Bring to mind three things that you are grateful for right now.' },
        { time: 40, text: 'They can be simple things – the chair you are sitting on, the air you are breathing.' },
        { time: 60, text: 'Silently, in your mind, acknowledge the first thing you are grateful for.' },
        { time: 75, text: 'Allow yourself to feel the genuine appreciation for this in your heart.' },
        { time: 100, text: 'Now, bring to mind the second thing you are grateful for.' },
        { time: 115, text: 'Hold it in your awareness and feel the warmth of gratitude.' },
        { time: 140, text: 'And now, the third thing. Feel the sense of fullness and contentment that gratitude brings.' },
        { time: 170, text: 'Let\'s expand this feeling. Bring to mind a person in your life for whom you are grateful.' },
        { time: 190, text: 'Picture them in your mind and feel the appreciation you have for them.' },
        { time: 215, text: 'Now, think of a simple pleasure you recently enjoyed.' },
        { time: 230, text: 'It could be a warm cup of tea, a beautiful sunset, or a pleasant conversation.' },
        { time: 250, text: 'Relive that moment for a few seconds and feel the gratitude for that experience.' },
        { time: 275, text: 'Finally, bring a sense of gratitude for yourself.' },
        { time: 290, text: 'Be thankful for your body that carries you through life, for your mind that allows you to experience the world.' },
        { time: 320, text: 'Sit for a few more moments, basking in this feeling of gratitude.' },
        { time: 345, text: 'Take a deep breath in, and as you exhale, carry this sense of gratitude with you.' },
        { time: 355, text: 'Gently open your eyes.' },
      ]
    },
    {
      title: 'Mountain Meditation',
      duration: 540, // 9 minutes
      cues: [
        { time: 0, text: 'Sit in a comfortable and dignified posture.' },
        { time: 10, text: 'Close your eyes and bring your awareness to your breath.' },
        { time: 25, text: 'Imagine a majestic mountain. See its solid base, its sloping sides, and its peak reaching towards the sky.' },
        { time: 50, text: 'This mountain is strong, stable, and unmoving.' },
        { time: 70, text: 'Now, imagine that you are this mountain.' },
        { time: 85, text: 'Your seated posture is the solid base of the mountain.' },
        { time: 100, text: 'Your spine is the strong, upright core.' },
        { time: 115, text: 'Your head is the peak, reaching towards wisdom and clarity.' },
        { time: 135, text: 'As the mountain, you are still and grounded.' },
        { time: 155, text: 'The seasons change around you. The sun shines brightly, the rain falls, and the snow blankets your slopes.' },
        { time: 180, text: 'Yet, through it all, the mountain remains.' },
        { time: 200, text: 'In the same way, your thoughts, feelings, and life circumstances are like the changing weather.' },
        { time: 225, text: 'They come and they go.' },
        { time: 240, text: 'But your core being, your inner mountain, remains strong and unshaken.' },
        { time: 270, text: 'Allow yourself to feel this deep sense of inner stability.' },
        { time: 300, text: 'You are grounded, centered, and resilient.' },
        { time: 345, text: 'Breathe in, feeling your strength. Breathe out, feeling your stability.' },
        { time: 390, text: 'Whatever storms may pass through your life, you can always return to this inner mountain of stillness.' },
        { time: 450, text: 'Rest in this feeling of unshakable presence.' },
        { time: 500, text: 'Gently begin to let go of the image of the mountain.' },
        { time: 520, text: 'Bring your awareness back to your body and your breath.' },
        { time: 530, text: 'When you feel ready, open your eyes.' },
      ]
    },
    {
        title: 'Letting Go of Thoughts',
        duration: 480, // 8 minutes
        cues: [
            { time: 0, text: 'Begin by finding a comfortable and quiet space to sit.' },
            { time: 10, text: 'Close your eyes and take a few deep breaths to anchor yourself in the present moment.' },
            { time: 25, text: 'Imagine you are sitting by a gently flowing stream.' },
            { time: 40, text: 'The water is clear, and you can see leaves floating by on the surface.' },
            { time: 60, text: 'Now, imagine that each thought that arises in your mind is a leaf on this stream.' },
            { time: 80, text: 'As a thought appears, place it on a leaf and watch it float by.' },
            { time: 100, text: 'You don\'t need to judge the thought or hold onto it. Simply acknowledge it and let it go.' },
            { time: 125, text: 'Some leaves may be large, some small. Some may float by quickly, others more slowly.' },
            { time: 150, text: 'Your only task is to watch the stream of your thoughts without getting swept away by it.' },
            { time: 180, text: 'If you find yourself caught in a thought, gently remind yourself that it is just a leaf on the stream.' },
            { time: 205, text: 'Let it go and return your attention to the flowing water.' },
            { time: 240, text: 'You are the observer, sitting peacefully on the bank of the stream.' },
            { time: 270, text: 'Notice the space between the thoughts, the moments of quiet in your mind.' },
            { time: 310, text: 'Continue this practice of placing each thought on a leaf and watching it float away.' },
            { time: 360, text: 'This practice helps to create a sense of detachment from your thoughts, recognizing that you are not your thoughts.' },
            { time: 405, text: 'You are the awareness that is watching the thoughts.' },
            { time: 440, text: 'In the final moments of this meditation, let go of the image of the stream.' },
            { time: 460, text: 'Simply rest in the quiet space you have created.' },
            { time: 470, text: 'When you are ready, gently open your eyes.' },
        ]
    },
    {
      title: 'Coming Home to the Present',
      duration: 240, // 4 minutes
      cues: [
        { time: 0, text: 'Wherever you are, take a moment to pause.' },
        { time: 8, text: 'You can close your eyes or keep them open with a soft gaze.' },
        { time: 15, text: 'Take three slow, conscious breaths.' },
        { time: 25, text: 'Breathing in, feel your belly expand.' },
        { time: 35, text: 'Breathing out, let go of any tension.' },
        { time: 50, text: 'Now, bring your awareness to your feet on the floor.' },
        { time: 60, text: 'Feel the solidness of the ground beneath you.' },
        { time: 75, text: 'Notice the feeling of the clothes on your skin.' },
        { time: 90, text: 'What sounds do you hear right now?' },
        { time: 105, text: 'What do you see in front of you?' },
        { time: 120, text: 'By engaging your senses, you are bringing yourself fully into the present moment.' },
        { time: 140, text: 'Now, ask yourself: "What is my experience right now?"' },
        { time: 155, text: 'Notice any thoughts, feelings, or bodily sensations without judgment.' },
        { time: 175, text: 'Simply acknowledge what is here.' },
        { time: 190, text: 'Take one more conscious breath.' },
        { time: 200, text: 'As you breathe in, feel a sense of calm and presence.' },
        { time: 210, text: 'As you breathe out, feel grounded and centered.' },
        { time: 225, text: 'You have arrived in the here and now. Carry this awareness with you as you continue your day.' },
        { time: 235, text: 'Gently bring your attention back to your surroundings.' },
      ]
    },
    {
      title: 'Generate Custom Script',
      duration: 0, 
      cues: [],
      isCustom: true,
    },
    {
      title: 'Simple Timer',
      duration: 0,
      cues: [],
      isTimerOnly: true,
    }
  ],
  es: [
    {
      title: 'Respiración Consciente',
      duration: 300, // 5 minutes
      cues: [
        {
          time: 0,
          text: `Encuentra una posición cómoda, ya sea sentado en una silla con los pies apoyados en el suelo, o en un cojín en el suelo. Permite que tu espalda esté recta pero no rígida. Cierra suavemente los ojos. Lleva tu atención a tu respiración. Nota la sensación del aire entrando por tus fosas nasales, llenando tus pulmones y luego saliendo de tu cuerpo. No intentes cambiar tu respiración de ninguna manera. Simplemente obsérvala.`,
        },
        {
          time: 120,
          text: `Mientras respiras, puedes notar que tu mente divaga. Esto es completamente normal. Cuando te des cuenta de que tu mente se ha distraído, guía suavemente y sin juzgar tu atención de vuelta a tu respiración. Siente el suave ascenso y descenso de tu pecho o abdomen con cada inhalación y exhalación.`,
        },
        {
          time: 270,
          text: `Estás en los momentos finales de esta sesión. Continúa descansando tu conciencia en el ritmo simple y natural de tu respiración. Cuando estés listo/a, comienza a traer lentamente tu conciencia de vuelta a la habitación. Mueve los dedos de las manos y los pies. Y cuando te sientas listo/a, abre suavemente los ojos.`,
        },
      ],
    },
    {
      title: 'Escaneo Corporal de 15 Minutos',
      duration: 900,
      cues: [
        {
          time: 0,
          text: `Comencemos el Escaneo Corporal. Encuentra una posición cómoda, acostado/a boca arriba si es posible, con los brazos a los lados y las piernas sin cruzar. Cierra los ojos suavemente y respira profundamente un par de veces para acomodarte.`
        },
        {
          time: 60,
          text: `Lleva tu conciencia a los dedos de tu pie izquierdo. Nota cualquier sensación que sientas allí: quizás calor, frío o un hormigueo. Lentamente, expande tu conciencia para incluir todo tu pie izquierdo, tobillo y pantorrilla.`
        },
        {
          time: 180,
          text: `Ahora, mueve tu atención hacia tu rodilla y muslo izquierdos. Sé consciente de todas y cada una de las sensaciones sin juzgar. Ahora, cambia tu enfoque a tu pie derecho y comienza a escanear hacia arriba a través de la pierna derecha, tal como lo hiciste con la izquierda.`
        },
        {
          time: 300,
          text: `Lleva tu conciencia ahora a tu pelvis y abdomen. Nota el suave ascenso y descenso con cada respiración. Suelta cualquier tensión que puedas estar sosteniendo aquí.`
        },
        {
          time: 480,
          text: `Mueve tu enfoque hacia tu pecho y hombros. Siente el peso de tu cuerpo hundiéndose en la superficie debajo de ti. Escanea tu conciencia por tus brazos hasta las yemas de los dedos, notando cualquier sensación en el camino.`
        },
        {
          time: 660,
          text: `Lleva suavemente tu atención a tu cuello y cara. Suaviza tu mandíbula, tus mejillas y los pequeños músculos alrededor de tus ojos. Deja que tu frente esté lisa y relajada.`
        },
        {
          time: 840,
          text: `Ahora, durante el último minuto, expande tu conciencia para abarcar todo tu cuerpo, desde la parte superior de tu cabeza hasta las puntas de tus pies. Siente la respiración moviéndose a través de ti, una suave ola de energía. Descansa en este estado de totalidad.`
        },
        {
          time: 890,
          text: `Nuestra sesión está llegando a su fin. Comienza a traer lentamente tu conciencia de vuelta a la habitación. Mueve los dedos de las manos y los pies. Cuando te sientas listo/a, abre suavemente los ojos.`
        }
      ]
    },
    {
      title: 'Meditación de Gratitud',
      duration: 360,
      cues: [
        { time: 0, text: 'Encuentra una posición cómoda y cierra suavemente los ojos.' },
        { time: 10, text: 'Toma unas cuantas respiraciones lentas y profundas para instalarte en este momento.' },
        { time: 25, text: 'Trae a la mente tres cosas por las que estás agradecido/a ahora mismo.' },
        { time: 40, text: 'Pueden ser cosas sencillas: la silla en la que estás sentado/a, el aire que respiras.' },
        { time: 60, text: 'En silencio, en tu mente, reconoce la primera cosa por la que estás agradecido/a.' },
        { time: 75, text: 'Permítete sentir el aprecio genuino por esto en tu corazón.' },
        { time: 100, text: 'Ahora, trae a la mente la segunda cosa por la que estás agradecido/a.' },
        { time: 115, text: 'Mantenla en tu conciencia y siente la calidez de la gratitud.' },
        { time: 140, text: 'Y ahora, la tercera cosa. Siente la sensación de plenitud y contentamiento que trae la gratitud.' },
        { time: 170, text: 'Expandamos este sentimiento. Trae a la mente a una persona en tu vida por la que estás agradecido/a.' },
        { time: 190, text: 'Imagínala en tu mente y siente el aprecio que tienes por ella.' },
        { time: 215, text: 'Ahora, piensa en un placer simple que hayas disfrutado recientemente.' },
        { time: 230, text: 'Podría ser una taza de té caliente, una hermosa puesta de sol o una conversación agradable.' },
        { time: 250, text: 'Revive ese momento por unos segundos y siente la gratitud por esa experiencia.' },
        { time: 275, text: 'Finalmente, trae un sentimiento de gratitud por ti mismo/a.' },
        { time: 290, text: 'Agradece a tu cuerpo que te lleva por la vida, a tu mente que te permite experimentar el mundo.' },
        { time: 320, text: 'Siéntate unos momentos más, disfrutando de este sentimiento de gratitud.' },
        { time: 345, text: 'Inhala profundamente, y al exhalar, lleva contigo este sentimiento de gratitud.' },
        { time: 355, text: 'Abre suavemente los ojos.' },
      ]
    },
    {
      title: 'Meditación de la Montaña',
      duration: 540,
      cues: [
        { time: 0, text: 'Siéntate en una postura cómoda y digna.' },
        { time: 10, text: 'Cierra los ojos y lleva tu conciencia a tu respiración.' },
        { time: 25, text: 'Imagina una montaña majestuosa. Observa su base sólida, sus laderas inclinadas y su cima alcanzando el cielo.' },
        { time: 50, text: 'Esta montaña es fuerte, estable e inamovible.' },
        { time: 70, text: 'Ahora, imagina que eres esta montaña.' },
        { time: 85, text: 'Tu postura sentada es la base sólida de la montaña.' },
        { time: 100, text: 'Tu columna vertebral es el núcleo fuerte y erguido.' },
        { time: 115, text: 'Tu cabeza es la cima, alcanzando la sabiduría y la claridad.' },
        { time: 135, text: 'Como la montaña, estás quieto/a y anclado/a.' },
        { time: 155, text: 'Las estaciones cambian a tu alrededor. El sol brilla intensamente, la lluvia cae y la nieve cubre tus laderas.' },
        { time: 180, text: 'Sin embargo, a través de todo, la montaña permanece.' },
        { time: 200, text: 'De la misma manera, tus pensamientos, sentimientos y circunstancias de la vida son como el clima cambiante.' },
        { time: 225, text: 'Vienen y van.' },
        { time: 240, text: 'Pero tu ser central, tu montaña interior, permanece fuerte e inquebrantable.' },
        { time: 270, text: 'Permítete sentir esta profunda sensación de estabilidad interior.' },
        { time: 300, text: 'Estás anclado/a, centrado/a y resiliente.' },
        { time: 345, text: 'Inhala, sintiendo tu fuerza. Exhala, sintiendo tu estabilidad.' },
        { time: 390, text: 'Cualquier tormenta que pase por tu vida, siempre puedes volver a esta montaña interior de quietud.' },
        { time: 450, text: 'Descansa en este sentimiento de presencia inquebrantable.' },
        { time: 500, text: 'Comienza a soltar suavemente la imagen de la montaña.' },
        { time: 520, text: 'Devuelve tu conciencia a tu cuerpo y a tu respiración.' },
        { time: 530, text: 'Cuando te sientas listo/a, abre los ojos.' },
      ]
    },
     {
        title: 'Dejar Ir los Pensamientos',
        duration: 480, // 8 minutes
        cues: [
            { time: 0, text: 'Comienza por encontrar un espacio cómodo y tranquilo para sentarte.' },
            { time: 10, text: 'Cierra los ojos y respira profundamente varias veces para anclarte en el momento presente.' },
            { time: 25, text: 'Imagina que estás sentado/a junto a un arroyo que fluye suavemente.' },
            { time: 40, text: 'El agua es clara y puedes ver hojas flotando en la superficie.' },
            { time: 60, text: 'Ahora, imagina que cada pensamiento que surge en tu mente es una hoja en este arroyo.' },
            { time: 80, text: 'Cuando aparece un pensamiento, colócalo en una hoja y míralo pasar flotando.' },
            { time: 100, text: 'No necesitas juzgar el pensamiento ni aferrarte a él. Simplemente reconócelo y déjalo ir.' },
            { time: 125, text: 'Algunas hojas pueden ser grandes, otras pequeñas. Algunas pueden pasar rápidamente, otras más lentamente.' },
            { time: 150, text: 'Tu única tarea es observar la corriente de tus pensamientos sin dejarte llevar por ella.' },
            { time: 180, text: 'Si te encuentras atrapado/a en un pensamiento, recuérdate suavemente que es solo una hoja en el arroyo.' },
            { time: 205, text: 'Déjalo ir y vuelve tu atención al agua que fluye.' },
            { time: 240, text: 'Tú eres el/la observador/a, sentado/a pacíficamente en la orilla del arroyo.' },
            { time: 270, text: 'Nota el espacio entre los pensamientos, los momentos de quietud en tu mente.' },
            { time: 310, text: 'Continúa esta práctica de colocar cada pensamiento en una hoja y verlo alejarse flotando.' },
            { time: 360, text: 'Esta práctica ayuda a crear una sensación de desapego de tus pensamientos, reconociendo que no eres tus pensamientos.' },
            { time: 405, text: 'Tú eres la conciencia que observa los pensamientos.' },
            { time: 440, text: 'En los momentos finales de esta meditación, suelta la imagen del arroyo.' },
            { time: 460, text: 'Simplemente descansa en el espacio tranquilo que has creado.' },
            { time: 470, text: 'Cuando estés listo/a, abre suavemente los ojos.' },
        ]
    },
    {
      title: 'Volver al Presente',
      duration: 240, // 4 minutos
      cues: [
        { time: 0, text: 'Dondequiera que estés, tómate un momento para hacer una pausa.' },
        { time: 8, text: 'Puedes cerrar los ojos o mantenerlos abiertos con una mirada suave.' },
        { time: 15, text: 'Toma tres respiraciones lentas y conscientes.' },
        { time: 25, text: 'Al inhalar, siente cómo se expande tu abdomen.' },
        { time: 35, text: 'Al exhalar, suelta cualquier tensión.' },
        { time: 50, text: 'Ahora, lleva tu conciencia a tus pies en el suelo.' },
        { time: 60, text: 'Siente la solidez del suelo debajo de ti.' },
        { time: 75, text: 'Nota la sensación de la ropa en tu piel.' },
        { time: 90, text: '¿Qué sonidos escuchas en este momento?' },
        { time: 105, text: '¿Qué ves frente a ti?' },
        { time: 120, text: 'Al involucrar tus sentidos, te estás trayendo completamente al momento presente.' },
        { time: 140, text: 'Ahora, pregúntate: "¿Cuál es mi experiencia en este momento?"' },
        { time: 155, text: 'Nota cualquier pensamiento, sentimiento o sensación corporal sin juzgar.' },
        { time: 175, text: 'Simplemente reconoce lo que está aquí.' },
        { time: 190, text: 'Toma una respiración consciente más.' },
        { time: 200, text: 'Al inhalar, siente una sensación de calma y presencia.' },
        { time: 210, text: 'Al exhalar, siéntete anclado/a y centrado/a.' },
        { time: 225, text: 'Has llegado al aquí y ahora. Lleva esta conciencia contigo mientras continúas tu día.' },
        { time: 235, text: 'Devuelve suavemente tu atención a tu entorno.' },
      ]
    },
    {
      title: 'Generar Guion Personalizado',
      duration: 0,
      cues: [],
      isCustom: true,
    },
    {
      title: 'Temporizador Simple',
      duration: 0,
      cues: [],
      isTimerOnly: true,
    }
  ],
  fr: [
    {
      title: 'Respiration Consciente',
      duration: 300, // 5 minutes
      cues: [
        {
          time: 0,
          text: `Trouvez une position confortable, assis sur une chaise avec les pieds à plat sur le sol, ou sur un coussin par terre. Laissez votre dos être droit mais pas raide. Fermez doucement les yeux. Portez votre attention sur votre respiration. Remarquez la sensation de l'air entrant par vos narines, remplissant vos poumons, puis quittant votre corps. N'essayez pas de changer votre respiration de quelque manière que ce soit. Observez-la simplement.`,
        },
        {
          time: 120,
          text: `Pendant que vous respirez, vous remarquerez peut-être que votre esprit vagabonde. C'est tout à fait normal. Lorsque vous réalisez que votre esprit s'est égaré, ramenez doucement et sans jugement votre attention sur votre souffle. Sentez le doux mouvement de votre poitrine ou de votre abdomen à chaque inspiration et expiration.`,
        },
        {
          time: 270,
          text: `Vous êtes dans les derniers instants de cette session. Continuez à reposer votre conscience sur le rythme simple et naturel de votre respiration. Quand vous serez prêt(e), commencez lentement à ramener votre conscience dans la pièce. Bougez vos doigts et vos orteils. Et quand vous vous sentirez prêt(e), ouvrez doucement les yeux.`,
        },
      ],
    },
     {
      title: 'Scan Corporel de 15 Minutes',
      duration: 900,
      cues: [
        {
            time: 0,
            text: `Commençons le Scan Corporel. Trouvez une position confortable, allongé(e) sur le dos si possible, avec les bras le long du corps et les jambes décroisées. Fermez doucement les yeux et prenez quelques respirations profondes pour vous installer.`
        },
        {
            time: 60,
            text: `Portez votre conscience sur les orteils de votre pied gauche. Remarquez toutes les sensations que vous y ressentez - peut-être de la chaleur, de la fraîcheur ou des picotements. Lentement, étendez votre conscience pour inclure tout votre pied gauche, votre cheville et votre mollet.`
        },
        {
            time: 180,
            text: `Maintenant, déplacez votre attention vers votre genou et votre cuisse gauches. Soyez conscient(e) de toutes les sensations sans jugement. Maintenant, déplacez votre attention sur votre pied droit, et commencez à balayer vers le haut à travers la jambe droite, comme vous l'avez fait avec la gauche.`
        },
        {
            time: 300,
            text: `Portez maintenant votre conscience sur votre bassin et votre abdomen. Remarquez le soulèvement et l'abaissement doux à chaque respiration. Lâchez toute tension que vous pourriez tenir ici.`
        },
        {
            time: 480,
            text: `Déplacez votre attention vers votre poitrine et vos épaules. Sentez le poids de votre corps s'enfoncer dans la surface sous vous. Balayez votre conscience le long de vos bras jusqu'au bout de vos doigts, en remarquant toutes les sensations en chemin.`
        },
        {
            time: 660,
            text: `Portez doucement votre attention sur votre cou et votre visage. Détendez votre mâchoire, vos joues et les petits muscles autour de vos yeux. Laissez votre front être lisse et détendu.`
        },
        {
            time: 840,
            text: `Maintenant, pour la dernière minute, étendez votre conscience pour englober tout votre corps, du sommet de votre tête au bout de vos orteils. Sentez le souffle qui vous traverse, une douce vague d'énergie. Reposez-vous dans cet état de plénitude.`
        },
        {
            time: 890,
            text: `Notre session touche à sa fin. Commencez lentement à ramener votre conscience dans la pièce. Bougez vos doigts et vos orteils. Quand vous vous sentirez prêt(e), ouvrez doucement les yeux.`
        }
      ]
    },
    {
      title: 'Méditation de Gratitude',
      duration: 360,
      cues: [
        { time: 0, text: 'Trouvez une position confortable et fermez doucement les yeux.' },
        { time: 10, text: 'Prenez quelques respirations lentes et profondes pour vous installer dans ce moment.' },
        { time: 25, text: 'Pensez à trois choses pour lesquelles vous êtes reconnaissant(e) en ce moment.' },
        { time: 40, text: 'Ce peuvent être des choses simples – la chaise sur laquelle vous êtes assis(e), l\'air que vous respirez.' },
        { time: 60, text: 'Silencieusement, dans votre esprit, reconnaissez la première chose pour laquelle vous êtes reconnaissant(e).' },
        { time: 75, text: 'Permettez-vous de ressentir une véritable appréciation pour cela dans votre cœur.' },
        { time: 100, text: 'Maintenant, pensez à la deuxième chose pour laquelle vous êtes reconnaissant(e).' },
        { time: 115, text: 'Maintenez-la dans votre conscience et ressentez la chaleur de la gratitude.' },
        { time: 140, text: 'Et maintenant, la troisième chose. Ressentez le sentiment de plénitude et de contentement que la gratitude apporte.' },
        { time: 170, text: 'Étendons ce sentiment. Pensez à une personne dans votre vie pour laquelle vous êtes reconnaissant(e).' },
        { time: 190, text: 'Imaginez-la dans votre esprit et ressentez l\'appréciation que vous avez pour elle.' },
        { time: 215, text: 'Maintenant, pensez à un simple plaisir que vous avez récemment apprécié.' },
        { time: 230, text: 'Cela pourrait être une tasse de thé chaud, un beau coucher de soleil ou une conversation agréable.' },
        { time: 250, text: 'Revivez ce moment pendant quelques secondes et ressentez la gratitude pour cette expérience.' },
        { time: 275, text: 'Enfin, ayez un sentiment de gratitude pour vous-même.' },
        { time: 290, text: 'Soyez reconnaissant(e) pour votre corps qui vous porte à travers la vie, pour votre esprit qui vous permet de découvrir le monde.' },
        { time: 320, text: 'Asseyez-vous encore quelques instants, baignant dans ce sentiment de gratitude.' },
        { time: 345, text: 'Inspirez profondément, et en expirant, emportez ce sentiment de gratitude avec vous.' },
        { time: 355, text: 'Ouvrez doucement les yeux.' },
      ]
    },
    {
      title: 'Méditation de la Montagne',
      duration: 540,
      cues: [
        { time: 0, text: 'Asseyez-vous dans une posture confortable et digne.' },
        { time: 10, text: 'Fermez les yeux et portez votre conscience sur votre respiration.' },
        { time: 25, text: 'Imaginez une montagne majestueuse. Voyez sa base solide, ses flancs en pente et son sommet atteignant le ciel.' },
        { time: 50, text: 'Cette montagne est forte, stable et immobile.' },
        { time: 70, text: 'Maintenant, imaginez que vous êtes cette montagne.' },
        { time: 85, text: 'Votre posture assise est la base solide de la montagne.' },
        { time: 100, text: 'Votre colonne vertébrale est le noyau solide et droit.' },
        { time: 115, text: 'Votre tête est le sommet, atteignant la sagesse et la clarté.' },
        { time: 135, text: 'En tant que montagne, vous êtes immobile et ancré(e).' },
        { time: 155, text: 'Les saisons changent autour de vous. Le soleil brille, la pluie tombe et la neige recouvre vos pentes.' },
        { time: 180, text: 'Pourtant, à travers tout cela, la montagne demeure.' },
        { time: 200, text: 'De même, vos pensées, vos sentiments et les circonstances de votre vie sont comme le temps qui change.' },
        { time: 225, text: 'Ils vont et viennent.' },
        { time: 240, text: 'Mais votre être profond, votre montagne intérieure, reste fort et inébranlable.' },
        { time: 270, text: 'Permettez-vous de ressentir ce profond sentiment de stabilité intérieure.' },
        { time: 300, text: 'Vous êtes ancré(e), centré(e) et résilient(e).' },
        { time: 345, text: 'Inspirez en sentant votre force. Expirez en sentant votre stabilité.' },
        { time: 390, text: 'Quelles que soient les tempêtes qui traversent votre vie, vous pouvez toujours retourner à cette montagne intérieure de calme.' },
        { time: 450, text: 'Reposez-vous dans ce sentiment de présence inébranlable.' },
        { time: 500, text: 'Commencez doucement à lâcher l\'image de la montagne.' },
        { time: 520, text: 'Ramenez votre conscience à votre corps et à votre respiration.' },
        { time: 530, text: 'Quand vous vous sentez prêt(e), ouvrez les yeux.' },
      ]
    },
    {
        title: 'Laisser Aller les Pensées',
        duration: 480, // 8 minutes
        cues: [
            { time: 0, text: 'Commencez par trouver un endroit confortable et calme pour vous asseoir.' },
            { time: 10, text: 'Fermez les yeux et prenez quelques respirations profondes pour vous ancrer dans le moment présent.' },
            { time: 25, text: 'Imaginez que vous êtes assis(e) au bord d\'un ruisseau qui coule doucement.' },
            { time: 40, text: 'L\'eau est claire et vous pouvez voir des feuilles flotter à la surface.' },
            { time: 60, text: 'Maintenant, imaginez que chaque pensée qui surgit dans votre esprit est une feuille sur ce ruisseau.' },
            { time: 80, text: 'Lorsqu\'une pensée apparaît, placez-la sur une feuille et regardez-la passer.' },
            { time: 100, text: 'Vous n\'avez pas besoin de juger la pensée ou de vous y accrocher. Simplement, reconnaissez-la et laissez-la partir.' },
            { time: 125, text: 'Certaines feuilles peuvent être grandes, d\'autres petites. Certaines peuvent passer rapidement, d\'autres plus lentement.' },
            { time: 150, text: 'Votre seule tâche est de regarder le flot de vos pensées sans vous laisser emporter.' },
            { time: 180, text: 'Si vous vous surprenez à être emporté(e) par une pensée, rappelez-vous doucement que ce n\'est qu\'une feuille sur le ruisseau.' },
            { time: 205, text: 'Laissez-la partir et revenez à l\'observation de l\'eau qui coule.' },
            { time: 240, text: 'Vous êtes l\'observateur/trice, assis(e) paisiblement sur la rive du ruisseau.' },
            { time: 270, text: 'Remarquez l\'espace entre les pensées, les moments de silence dans votre esprit.' },
            { time: 310, text: 'Continuez cette pratique de placer chaque pensée sur une feuille et de la regarder s\'éloigner.' },
            { time: 360, text: 'Cette pratique aide à créer un sentiment de détachement de vos pensées, en reconnaissant que vous n\'êtes pas vos pensées.' },
            { time: 405, text: 'Vous êtes la conscience qui observe les pensées.' },
            { time: 440, text: 'Dans les derniers instants de cette méditation, abandonnez l\'image du ruisseau.' },
            { time: 460, text: 'Reposez-vous simplement dans l\'espace calme que vous avez créé.' },
            { time: 470, text: 'Quand vous êtes prêt(e), ouvrez doucement les yeux.' },
        ]
    },
    {
      title: 'Retour au Présent',
      duration: 240, // 4 minutes
      cues: [
        { time: 0, text: 'Où que vous soyez, prenez un moment pour faire une pause.' },
        { time: 8, text: 'Vous pouvez fermer les yeux ou les garder ouverts avec un regard doux.' },
        { time: 15, text: 'Prenez trois respirations lentes et conscientes.' },
        { time: 25, text: 'En inspirant, sentez votre ventre se gonfler.' },
        { time: 35, text: 'En expirant, laissez aller toute tension.' },
        { time: 50, text: 'Maintenant, portez votre attention sur vos pieds sur le sol.' },
        { time: 60, text: 'Sentez la solidité du sol sous vous.' },
        { time: 75, text: 'Remarquez la sensation des vêtements sur votre peau.' },
        { time: 90, text: 'Quels sons entendez-vous en ce moment ?' },
        { time: 105, text: 'Que voyez-vous devant vous ?' },
        { time: 120, text: 'En engageant vos sens, vous vous ramenez pleinement au moment présent.' },
        { time: 140, text: 'Maintenant, demandez-vous : "Quelle est mon expérience en ce moment ?"' },
        { time: 155, text: 'Remarquez les pensées, les sentiments ou les sensations corporelles sans jugement.' },
        { time: 175, text: 'Reconnaissez simplement ce qui est là.' },
        { time: 190, text: 'Prenez une autre respiration consciente.' },
        { time: 200, text: 'En inspirant, ressentez un sentiment de calme et de présence.' },
        { time: 210, text: 'En expirant, sentez-vous ancré(e) et centré(e).' },
        { time: 225, text: 'Vous êtes arrivé(e) dans l\'ici et maintenant. Emportez cette conscience avec vous tout au long de votre journée.' },
        { time: 235, text: 'Ramenez doucement votre attention à votre environnement.' },
      ]
    },
    {
      title: 'Générer un Script Personnalisé',
      duration: 0,
      cues: [],
      isCustom: true,
    },
    {
      title: 'Minuteur Simple',
      duration: 0,
      cues: [],
      isTimerOnly: true,
    }
  ],
};
