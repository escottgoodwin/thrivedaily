
export type MeditationCue = {
  time: number; // Time in seconds when the cue should be read
  text: string;
};

export type TimedMeditationScript = {
  title: string;
  duration: number; // Total duration in seconds
  cues: MeditationCue[];
  isCustom?: boolean;
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
      title: 'Custom Timer',
      duration: 0, 
      cues: [],
      isCustom: true,
    },
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
      title: 'Temporizador Personalizado',
      duration: 0,
      cues: [],
      isCustom: true,
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
      title: 'Minuterie Personnalisée',
      duration: 0,
      cues: [],
      isCustom: true,
    }
  ],
};
