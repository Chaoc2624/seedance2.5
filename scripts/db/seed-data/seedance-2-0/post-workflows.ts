import type { SeedPostDefinition } from './types';

/**
 * Humanized SEO long-form: creative workflows with Seedance 2.0.
 */
export const postWorkflows: SeedPostDefinition = {
  slug: 'seedance-2-0-creative-workflows',
  createdAt: '2026-07-11T10:00:00.000Z',
  authorName: 'Seedance Editorial',
  tags: 'seedance-2.0,workflow,reference-to-video,prompting',
  image: '/imgs/blog/seedance-2-0-creative-workflows.jpg',
  locales: {
    en: {
      title: 'Seedance 2.0 Workflows: Prompts and Multi-Shot Control',
      description:
        'Build better Seedance 2.0 clips with shot lists, multimodal references, audio cues, extension, editing, and a repeatable production workflow for creators.',
      content: `Specs only get you so far. Most failed Seedance 2.0 takes come from weak briefs, not from "the model is broken." This article is a working playbook for text, image, audio, and video inputs, with an iteration loop you can repeat on any host that exposes the 2.0 family.

## Start with a shot list, not a vibe sentence

A one-line mood prompt ("cinematic rainy street, emotional") forces the model to invent structure. Better: write the clip as 3-6 beats.

Example skeleton:

1. Opening insert (object or environment, 1-2s)
2. Character entrance with clear action
3. Interaction or product moment
4. Reaction / payoff
5. Optional brand or text-safe end frame

Seedance 2.0 handles multi-shot sequences more cleanly when the prompt names camera moves and timing. Borrow film language: low angle, push-in, whip pan, insert, two-shot. You do not need perfect jargon; you need ordered events.

## Multimodal stack that actually helps

### Images

Use images when identity or layout must stay stable:

- Character sheet or clean portrait
- Location plate
- Storyboard frames
- Product packshot with readable silhouette

Avoid busy collages. One job per image. If the host supports labeled references (@Image 1), use the labels in the prompt.

### Video references

Short motion references beat long ones. Feed a clip when you need:

- Camera path
- Body rhythm (dance, sport)
- Edit pace

Keep combined video reference length inside the host limit (often around 15 seconds total across clips).

### Audio references

Audio is easy to underuse. A 3-8 second sample can lock:

- Voice timbre
- Music genre and tempo
- Foley texture (rain, crowd, machinery)

Say what to keep and what to ignore ("match the percussion tempo, invent new melody").

## Three production recipes

### 1) Product ad (I2V + text)

Inputs: hero product still, optional lifestyle plate, 40-80 word script with camera notes.
Goal: readable product, one clear action, audio that sells the moment.
Tip: put the product in the first and last second of the brief so framing does not drift.

### 2) Character short (multi-image + text)

Inputs: 2-3 consistent character stills, wardrobe note, location image.
Goal: same face and outfit across shots.
Tip: if identity drifts, reduce simultaneous characters before you write a longer prompt.

### 3) Music-led social cut (audio + text or R2V)

Inputs: music bed or SFX bed, beat markers in text ("hit on the snare at the spin").
Goal: motion accents land on audio accents.
Tip: generate two durations (for example 5s and 10s) and pick the one that breathes.

## Controllability: extend and edit instead of restarting

When 80% of a take works, do not burn credits regenerating from zero. Use extension to continue the ride, or edit prompts to change one beat (swap the ending action, keep wardrobe). Official materials push these flows as core 2.0 strengths.

A stable loop:

1. Draft on Fast or Mini for structure
2. Lock prompt + references
3. Final pass on standard Seedance 2.0
4. Extend only the keeper take
5. Finish text, color, and loudness in an NLE

## Prompt hygiene that reduces retries

- Name the subject once, then reuse the same label ("the courier in orange")
- Prefer concrete verbs over adjectives
- Cap the number of simultaneous camera tricks
- State what should stay silent if you want ASMR or dialogue-only beds
- Keep on-screen text out of the model when possible; composite later

## Rights and safety

Reference uploads can include faces, logos, and music. Technical success is not legal clearance. Prefer licensed stock, synthetic characters, or talent you control. Hosts may require identity checks for real-person likeness.

## FAQ

### How many references should I start with?

Start with one strong image or none. Add references only when a failure mode appears (face drift, wrong location, flat audio). More inputs can help or confuse.

### Why does my multi-shot clip feel random?

Usually missing shot order. Number the beats. Add transitions ("cut to," "camera holds," "match on action").

### Should every project use audio generation?

No. Silent loops and template B-roll may be cheaper without it. Use native audio when lip energy, foley, or music timing is part of the deliverable.

### Can Seedance 2.0 replace an editor?

No. It replaces empty timeline syndrome. You still choose takes, fix pacing, and ship platform-safe exports.

### What is the fastest way to learn the model?

Pick one recipe (product ad or character short). Generate 10 variations with the same references and only change one prompt variable at a time.

## Closing

Treat Seedance 2.0 like a junior director with perfect stamina and imperfect taste. Give it ordered shots, clean references, and a small number of hard constraints. Save hero fidelity for the final pass. The workflow, not the slogan, is what makes the model look expensive on a real timeline.

## Sources

Primary sources for the model capabilities and technical context.

- [Seedance 2.0 official launch](https://seed.bytedance.com/blog/seedance-2-0-official-launch)
- [Seedance 2.0 research paper](https://arxiv.org/abs/2604.14148)

## Related reading

- [Seedance 2.0 features: what ByteDance's video model actually does](/blog/seedance-2-0-features-overview) — inputs, duration, resolution, and honest limits.
- [Seedance 2.0 Fast vs Mini: which model for drafts, volume, and finals?](/blog/seedance-2-0-fast-vs-mini) — choose the tier for exploration versus client masters.

## Try it on Seedance 2.5

Apply the playbook in the [AI video generator](/generate): ordered shots, references, and short iteration loops in the product.
`,
    },
    de: {
      title:
        'Seedance 2.0 Workflows: Prompts, Referenzen und Multi-Shot-Kontrolle',
      description:
        'Seedance 2.0 wie ein Short-Form-Regisseur nutzen: Shotlists, multimodale Referenzen, Audio-Cues, Extension und Iteration.',
      content: `Spezifikationen allein bringen Sie nur so weit. Die meisten gescheiterten Seedance-2.0-Takes kommen von schwachen Briefs, nicht davon, dass „das Modell kaputt“ ist. Dieser Artikel ist ein Arbeits-Playbook für Text-, Bild-, Audio- und Video-Inputs — mit einer Iterationsschleife, die Sie auf jedem Host wiederholen können, der die 2.0-Familie anbietet.

## Mit einer Shotliste starten, nicht mit einem Vibe-Satz

Ein einzeiliger Mood-Prompt („cinematic rainy street, emotional“) zwingt das Modell, Struktur zu erfinden. Besser: den Clip als 3–6 Beats schreiben.

Beispiel-Skelett:

1. Opening-Insert (Objekt oder Umgebung, 1–2s)
2. Charakter-Einstieg mit klarer Aktion
3. Interaktion oder Produktmoment
4. Reaktion / Payoff
5. Optionaler Brand- oder text-sicherer Endframe

Seedance 2.0 handhabt Multi-Shot-Sequenzen sauberer, wenn der Prompt Kamerafahrten und Timing benennt. Leihen Sie Filmsprache: low angle, push-in, whip pan, insert, two-shot. Sie brauchen keinen perfekten Jargon — geordnete Ereignisse.

## Multimodaler Stack, der wirklich hilft

### Bilder

Bilder nutzen, wenn Identität oder Layout stabil bleiben müssen:

- Character Sheet oder sauberes Portrait
- Location Plate
- Storyboard-Frames
- Produkt-Packshot mit lesbarer Silhouette

Vermeiden Sie unruhige Collagen. Ein Job pro Bild. Wenn der Host gelabelte Referenzen (@Image 1) unterstützt, Labels im Prompt verwenden.

### Video-Referenzen

Kurze Motion-Referenzen schlagen lange. Einen Clip füttern, wenn Sie brauchen:

- Kamerapfad
- Körperrhythmus (Tanz, Sport)
- Edit-Pace

Kombinierte Video-Referenzlänge im Host-Limit halten (oft etwa 15 Sekunden gesamt über alle Clips).

### Audio-Referenzen

Audio wird leicht unterschätzt. Ein 3–8-Sekunden-Sample kann fixieren:

- Stimm-Timbre
- Musikgenre und Tempo
- Foley-Textur (Regen, Menge, Maschinen)

Sagen Sie, was bleiben und was ignoriert werden soll („Percussion-Tempo matchen, neue Melodie erfinden“).

## Drei Produktionsrezepte

### 1) Produkt-Ad (I2V + Text)

Inputs: Hero-Produktstill, optionales Lifestyle-Plate, 40–80 Wörter Skript mit Kamera-Notes.
Ziel: lesbares Produkt, eine klare Aktion, Audio, das den Moment verkauft.
Tipp: Produkt in die erste und letzte Sekunde des Briefs legen, damit das Framing nicht driftet.

### 2) Charakter-Short (Multi-Image + Text)

Inputs: 2–3 konsistente Charakter-Stills, Wardrobe-Note, Location-Bild.
Ziel: gleiches Gesicht und Outfit über Shots hinweg.
Tipp: bei Identitätsdrift zuerst die Zahl gleichzeitiger Charaktere reduzieren, bevor Sie den Prompt verlängern.

### 3) Music-led Social Cut (Audio + Text oder R2V)

Inputs: Music Bed oder SFX Bed, Beat-Marker im Text („Hit auf der Snare beim Spin“).
Ziel: Motion-Akzente landen auf Audio-Akzenten.
Tipp: zwei Dauern generieren (z. B. 5s und 10s) und die nehmen, die atmet.

## Steuerbarkeit: Extend und Edit statt Neustart

Wenn 80 % eines Takes funktionieren, Credits nicht mit Null-Regenerierung verbrennen. Extension nutzen, um weiterzufahren, oder Edit-Prompts, um einen Beat zu ändern (Ending-Action tauschen, Wardrobe behalten). Offizielle Materialien positionieren diese Flows als Kernstärken von 2.0.

Stabile Schleife:

1. Draft auf Fast oder Mini für Struktur
2. Prompt + Referenzen locken
3. Final-Pass auf Standard Seedance 2.0
4. Nur den Keeper-Take extenden
5. Text, Color und Loudness im NLE finalisieren

## Prompt-Hygiene, die Retries senkt

- Subjekt einmal benennen, dann dasselbe Label wiederverwenden („der Kurier in Orange“)
- Konkrete Verben statt Adjektive bevorzugen
- Anzahl gleichzeitiger Kamera-Tricks deckeln
- Angeben, was still bleiben soll, wenn Sie ASMR oder dialog-only Beds wollen
- On-Screen-Text möglichst aus dem Modell heraushalten; später compositen

## Rechte und Safety

Referenz-Uploads können Gesichter, Logos und Musik enthalten. Technischer Erfolg ist keine rechtliche Freigabe. Lizenzierte Stocks, synthetische Charaktere oder Talente, die Sie kontrollieren, bevorzugen. Hosts können Identitätschecks für Real-Person-Likeness verlangen.

## FAQ

### Mit wie vielen Referenzen starten?

Mit einem starken Bild oder keinem. Referenzen nur hinzufügen, wenn ein Failure-Mode auftaucht (Gesichtsdrift, falsche Location, flaches Audio). Mehr Inputs können helfen oder verwirren.

### Warum wirkt mein Multi-Shot-Clip zufällig?

Meist fehlende Shot-Reihenfolge. Beats nummerieren. Transitions ergänzen („cut to“, „camera holds“, „match on action“).

### Sollte jedes Projekt Audio-Generation nutzen?

Nein. Stille Loops und Template-B-Roll können ohne günstiger sein. Natives Audio, wenn Lip-Energy, Foley oder Musik-Timing Teil des Deliverables ist.

### Kann Seedance 2.0 einen Editor ersetzen?

Nein. Es ersetzt das leere-Timeline-Syndrom. Sie wählen weiterhin Takes, fixen Pace und shippen plattform-sichere Exports.

### Was ist der schnellste Weg, das Modell zu lernen?

Ein Rezept wählen (Produkt-Ad oder Charakter-Short). 10 Variationen mit denselben Referenzen generieren und pro Durchlauf nur eine Prompt-Variable ändern.

## Abschluss

Behandeln Sie Seedance 2.0 wie einen Junior-Director mit perfekter Ausdauer und unvollkommenem Geschmack. Geordnete Shots, saubere Referenzen und wenige harte Constraints geben. Hero-Fidelity für den Final-Pass sparen. Der Workflow — nicht der Slogan — lässt das Modell auf einer echten Timeline teuer aussehen.

## Quellen

Primärquellen für Modellfähigkeiten und technischen Kontext.

- [Seedance 2.0 official launch](https://seed.bytedance.com/blog/seedance-2-0-official-launch)
- [Seedance 2.0 research paper](https://arxiv.org/abs/2604.14148)

## Weiterlesen

- [Seedance 2.0 Features: Was das Video-Modell von ByteDance wirklich kann](/blog/seedance-2-0-features-overview) — Inputs, Dauer, Auflösung und ehrliche Grenzen.
- [Seedance 2.0 Fast vs Mini: Welches Modell für Drafts, Volumen und Finals?](/blog/seedance-2-0-fast-vs-mini) — Stufe für Exploration vs. kundenfertige Master wählen.

## Direkt in Seedance 2.5 testen

Setzen Sie das Playbook im [KI-Video-Generator](/generate) um: geordnete Shots, Referenzen und kurze Iterationen im Produkt.
`,
    },
    fr: {
      title:
        'Workflows créatifs Seedance 2.0 : prompts, références et contrôle multi-plans',
      description:
        "Utiliser Seedance 2.0 comme un réalisateur short-form : shot list, références multimodales, audio, extension et boucle d'itération.",
      content: `Les specs seules ne suffisent pas. La plupart des prises Seedance 2.0 ratées viennent de briefs faibles, pas d'un « modèle cassé ». Cet article est un playbook de production pour les entrées texte, image, audio et vidéo, avec une boucle d'itération reproductible sur tout hôte qui expose la famille 2.0.

## Commencer par une shot list, pas une phrase d'ambiance

Un prompt mood d'une ligne (« cinematic rainy street, emotional ») force le modèle à inventer la structure. Mieux : écrire le clip en 3 à 6 beats.

Squelette d'exemple :

1. Insert d'ouverture (objet ou environnement, 1-2s)
2. Entrée du personnage avec action claire
3. Interaction ou moment produit
4. Réaction / payoff
5. Frame de fin optionnelle brand ou safe pour le texte

Seedance 2.0 gère mieux les séquences multi-plans quand le prompt nomme les mouvements de caméra et le timing. Empruntez le langage film : low angle, push-in, whip pan, insert, two-shot. Le jargon parfait n'est pas requis ; des événements ordonnés, oui.

## Stack multimodale qui aide vraiment

### Images

Utilisez des images quand l'identité ou le layout doit rester stable :

- Character sheet ou portrait propre
- Plate de lieu
- Frames de storyboard
- Packshot produit avec silhouette lisible

Évitez les collages chargés. Un job par image. Si l'hôte supporte des références labellisées (@Image 1), utilisez les labels dans le prompt.

### Références vidéo

Les courtes références de motion battent les longues. Fournissez un clip quand vous avez besoin de :

- Trajectoire caméra
- Rythme du corps (danse, sport)
- Pace de montage

Gardez la durée combinée des références vidéo dans la limite hôte (souvent autour de 15 secondes au total).

### Références audio

L'audio est facile à sous-utiliser. Un sample de 3-8 secondes peut verrouiller :

- Timbre de voix
- Genre et tempo musicaux
- Texture de foley (pluie, foule, machines)

Dites ce qu'il faut garder et ignorer (« matcher le tempo de percussion, inventer une nouvelle mélodie »).

## Trois recettes de production

### 1) Pub produit (I2V + texte)

Entrées : still hero produit, plate lifestyle optionnelle, script de 40-80 mots avec notes caméra.
Objectif : produit lisible, une action claire, audio qui vend le moment.
Astuce : placez le produit dans la première et la dernière seconde du brief pour éviter la dérive de cadrage.

### 2) Short personnage (multi-image + texte)

Entrées : 2-3 stills personnage cohérents, note de garde-robe, image de lieu.
Objectif : même visage et tenue d'un plan à l'autre.
Astuce : si l'identité dérive, réduisez le nombre de personnages simultanés avant d'allonger le prompt.

### 3) Cut social mené par la musique (audio + texte ou R2V)

Entrées : lit musical ou SFX, marqueurs de beat dans le texte (« hit sur la snare au spin »).
Objectif : les accents de motion tombent sur les accents audio.
Astuce : générez deux durées (par ex. 5s et 10s) et gardez celle qui respire.

## Contrôlabilité : extend et edit plutôt que tout recommencer

Quand 80 % d'une prise fonctionne, ne brûlez pas les crédits en regénérant à zéro. Utilisez l'extension pour continuer, ou des prompts d'edit pour changer un beat (échanger l'action de fin, garder la garde-robe). Les matériaux officiels positionnent ces flux comme forces centrales de la 2.0.

Boucle stable :

1. Draft sur Fast ou Mini pour la structure
2. Verrouiller prompt + références
3. Pass final sur Seedance 2.0 standard
4. N'étendre que la prise keeper
5. Finir texte, étalonnage et loudness dans un NLE

## Hygiène de prompt qui réduit les retries

- Nommer le sujet une fois, puis réutiliser le même label (« le coursier en orange »)
- Préférer les verbes concrets aux adjectifs
- Plafonner le nombre d'astuces caméra simultanées
- Indiquer ce qui doit rester silencieux pour ASMR ou lits dialogue only
- Garder le texte à l'écran hors du modèle si possible ; compositez plus tard

## Droits et safety

Les uploads de référence peuvent inclure visages, logos et musique. Le succès technique n'est pas une autorisation légale. Préférez stock licencié, personnages synthétiques ou talents que vous contrôlez. Les hôtes peuvent exiger des contrôles d'identité pour les ressemblances de personnes réelles.

## FAQ

### Avec combien de références commencer ?

Commencez avec une image forte ou aucune. Ajoutez des références seulement quand un mode d'échec apparaît (dérive de visage, mauvais lieu, audio plat). Plus d'entrées peut aider ou confondre.

### Pourquoi mon clip multi-plans paraît-il aléatoire ?

Souvent l'ordre des plans manque. Numérotez les beats. Ajoutez des transitions (« cut to », « camera holds », « match on action »).

### Faut-il de l'audio généré sur chaque projet ?

Non. Les boucles silencieuses et le B-roll template peuvent coûter moins cher sans. Utilisez l'audio natif quand l'énergie de lèvres, le foley ou le timing musical font partie du livrable.

### Seedance 2.0 peut-il remplacer un monteur ?

Non. Il remplace le syndrome de timeline vide. Vous choisissez encore les prises, corrigez le pace et livrez des exports sûrs pour chaque plateforme.

### Quel est le moyen le plus rapide d'apprendre le modèle ?

Choisissez une recette (pub produit ou short personnage). Générez 10 variations avec les mêmes références en ne changeant qu'une variable de prompt à la fois.

## Clôture

Traitez Seedance 2.0 comme un junior director à l'endurance parfaite et au goût imparfait. Donnez-lui des plans ordonnés, des références propres et peu de contraintes dures. Gardez la fidélité hero pour le pass final. C'est le workflow, pas le slogan, qui fait paraître le modèle cher sur une vraie timeline.

## Sources

Sources principales pour les capacités du modèle et le contexte technique.

- [Seedance 2.0 official launch](https://seed.bytedance.com/blog/seedance-2-0-official-launch)
- [Seedance 2.0 research paper](https://arxiv.org/abs/2604.14148)

## À lire aussi

- [Fonctionnalités Seedance 2.0 : ce que fait vraiment le modèle vidéo de ByteDance](/blog/seedance-2-0-features-overview) — entrées, durée, résolution et limites honnêtes.
- [Seedance 2.0 Fast vs Mini : quel modèle pour brouillons, volume et finals ?](/blog/seedance-2-0-fast-vs-mini) — choisir le palier exploration vs masters clients.

## Essayez sur Seedance 2.5

Appliquez le playbook dans le [générateur vidéo IA](/generate) : plans ordonnés, références et itérations courtes dans le produit.
`,
    },
    es: {
      title:
        'Flujos creativos con Seedance 2.0: prompts, referencias y control multiplano',
      description:
        'Cómo dirigir Seedance 2.0 en short-form: shot list, referencias multimodales, audio, extensión y bucle de iteración.',
      content: `Las specs solas solo te llevan hasta cierto punto. La mayoría de tomas fallidas de Seedance 2.0 vienen de briefs débiles, no de que «el modelo esté roto». Este artículo es un playbook de trabajo para entradas de texto, imagen, audio y vídeo, con un bucle de iteración que puedes repetir en cualquier host que exponga la familia 2.0.

## Empieza con una shot list, no con una frase de vibe

Un prompt de mood de una línea («cinematic rainy street, emotional») obliga al modelo a inventar estructura. Mejor: escribe el clip en 3-6 beats.

Esqueleto de ejemplo:

1. Insert de apertura (objeto o entorno, 1-2s)
2. Entrada del personaje con acción clara
3. Interacción o momento de producto
4. Reacción / payoff
5. Frame final opcional de marca o seguro para texto

Seedance 2.0 maneja secuencias multipiano con más limpieza cuando el prompt nombra movimientos de cámara y timing. Toma prestado el lenguaje de cine: low angle, push-in, whip pan, insert, two-shot. No necesitas jerga perfecta; sí eventos ordenados.

## Stack multimodal que de verdad ayuda

### Imágenes

Usa imágenes cuando la identidad o el layout deban mantenerse estables:

- Character sheet o retrato limpio
- Plate de localización
- Frames de storyboard
- Packshot de producto con silueta legible

Evita collages recargados. Un trabajo por imagen. Si el host soporta referencias etiquetadas (@Image 1), úsalas en el prompt.

### Referencias de vídeo

Las referencias de motion cortas ganan a las largas. Alimenta un clip cuando necesites:

- Trayectoria de cámara
- Ritmo corporal (baile, deporte)
- Pace de edición

Mantén la longitud combinada de referencias de vídeo dentro del límite del host (a menudo unos 15 segundos en total entre clips).

### Referencias de audio

El audio es fácil de infrautilizar. Una muestra de 3-8 segundos puede fijar:

- Timbre de voz
- Género y tempo musicales
- Textura de foley (lluvia, multitud, maquinaria)

Di qué conservar e ignorar («iguala el tempo de la percusión, inventa una melodía nueva»).

## Tres recetas de producción

### 1) Anuncio de producto (I2V + texto)

Entradas: still hero del producto, plate lifestyle opcional, guion de 40-80 palabras con notas de cámara.
Objetivo: producto legible, una acción clara, audio que venda el momento.
Tip: pon el producto en el primer y el último segundo del brief para que el encuadre no derive.

### 2) Short de personaje (multi-imagen + texto)

Entradas: 2-3 stills de personaje consistentes, nota de vestuario, imagen de localización.
Objetivo: misma cara y outfit entre planos.
Tip: si la identidad deriva, reduce personajes simultáneos antes de alargar el prompt.

### 3) Corte social guiado por música (audio + texto o R2V)

Entradas: cama musical o de SFX, marcadores de beat en el texto («hit en la caja en el spin»).
Objetivo: los acentos de motion caen en los acentos de audio.
Tip: genera dos duraciones (por ejemplo 5s y 10s) y elige la que respira.

## Controlabilidad: extend y edit en lugar de reiniciar

Cuando el 80 % de una toma funciona, no quemes créditos regenerando desde cero. Usa extensión para continuar, o prompts de edit para cambiar un beat (cambiar la acción final, mantener el vestuario). Los materiales oficiales posicionan estos flujos como fortalezas centrales de 2.0.

Bucle estable:

1. Draft en Fast o Mini para la estructura
2. Bloquear prompt + referencias
3. Pase final en Seedance 2.0 estándar
4. Extender solo la toma keeper
5. Cerrar texto, color y loudness en un NLE

## Higiene de prompt que reduce reintentos

- Nombra al sujeto una vez y reutiliza la misma etiqueta («el mensajero de naranja»)
- Prefiere verbos concretos a adjetivos
- Limita el número de trucos de cámara simultáneos
- Indica qué debe quedar en silencio si quieres ASMR o camas solo de diálogo
- Mantén el texto en pantalla fuera del modelo cuando sea posible; compón después

## Derechos y safety

Las subidas de referencia pueden incluir caras, logos y música. El éxito técnico no es autorización legal. Prefiere stock licenciado, personajes sintéticos o talento que controles. Los hosts pueden exigir comprobaciones de identidad para likeness de personas reales.

## FAQ

### ¿Con cuántas referencias empiezo?

Empieza con una imagen fuerte o ninguna. Añade referencias solo cuando aparezca un modo de fallo (deriva de cara, localización incorrecta, audio plano). Más entradas pueden ayudar o confundir.

### ¿Por qué mi clip multipiano se siente aleatorio?

Suele faltar orden de planos. Numera los beats. Añade transiciones («cut to», «camera holds», «match on action»).

### ¿Debe cada proyecto usar generación de audio?

No. Los loops silenciosos y el B-roll de plantilla pueden ser más baratos sin él. Usa audio nativo cuando la energía de labios, el foley o el timing musical formen parte del entregable.

### ¿Puede Seedance 2.0 reemplazar a un editor?

No. Sustituye el síndrome de timeline vacía. Sigues eligiendo tomas, arreglando el pace y enviando exports seguros para cada plataforma.

### ¿Cuál es la forma más rápida de aprender el modelo?

Elige una receta (anuncio de producto o short de personaje). Genera 10 variaciones con las mismas referencias y cambia solo una variable del prompt cada vez.

## Cierre

Trata Seedance 2.0 como un junior director con stamina perfecta y gusto imperfecto. Dale planos ordenados, referencias limpias y pocas restricciones duras. Guarda la fidelidad hero para el pase final. El workflow, no el eslogan, es lo que hace que el modelo se vea caro en una timeline real.

## Fuentes

Fuentes primarias para las capacidades del modelo y el contexto técnico.

- [Seedance 2.0 official launch](https://seed.bytedance.com/blog/seedance-2-0-official-launch)
- [Seedance 2.0 research paper](https://arxiv.org/abs/2604.14148)

## Lecturas relacionadas

- [Funciones de Seedance 2.0: qué hace de verdad el modelo de vídeo de ByteDance](/blog/seedance-2-0-features-overview) — entradas, duración, resolución y límites honestos.
- [Seedance 2.0 Fast vs Mini: ¿qué modelo para borradores, volumen y finales?](/blog/seedance-2-0-fast-vs-mini) — elige el nivel para explorar vs. masters de cliente.

## Pruébalo en Seedance 2.5

Lleva el playbook al [generador de vídeo con IA](/generate): planos ordenados, referencias e iteraciones cortas dentro del producto.
`,
    },
    it: {
      title:
        'Workflow creativi con Seedance 2.0: prompt, riferimenti e controllo multi-shot',
      description:
        'Come dirigere Seedance 2.0 in short-form: shot list, riferimenti multimodali, audio, extension e ciclo di iterazione.',
      content: `Le sole specifiche non bastano. La maggior parte delle take Seedance 2.0 fallite nasce da brief deboli, non da un «modello rotto». Questo articolo è un playbook operativo per input di testo, immagine, audio e video, con un loop di iterazione ripetibile su qualsiasi host che esponga la famiglia 2.0.

## Parti da una shot list, non da una frase di vibe

Un prompt mood di una riga («cinematic rainy street, emotional») costringe il modello a inventare la struttura. Meglio: scrivi la clip in 3-6 beat.

Scheletro di esempio:

1. Insert di apertura (oggetto o ambiente, 1-2s)
2. Entrata del personaggio con azione chiara
3. Interazione o momento prodotto
4. Reazione / payoff
5. Frame finale opzionale brand o text-safe

Seedance 2.0 gestisce sequenze multi-shot in modo più pulito quando il prompt nomina movimenti di camera e timing. Prendi in prestito il linguaggio filmico: low angle, push-in, whip pan, insert, two-shot. Non serve gergo perfetto; servono eventi ordinati.

## Stack multimodale che aiuta davvero

### Immagini

Usa le immagini quando identità o layout devono restare stabili:

- Character sheet o ritratto pulito
- Plate di location
- Frame di storyboard
- Packshot prodotto con silhouette leggibile

Evita collage confusi. Un compito per immagine. Se l'host supporta riferimenti etichettati (@Image 1), usali nel prompt.

### Riferimenti video

I riferimenti di motion brevi battono quelli lunghi. Dai un clip quando ti serve:

- Percorso di camera
- Ritmo del corpo (danza, sport)
- Pace di montaggio

Tieni la durata combinata dei riferimenti video dentro il limite host (spesso intorno a 15 secondi totali tra i clip).

### Riferimenti audio

L'audio è facile da sottoutilizzare. Un sample di 3-8 secondi può bloccare:

- Timbro di voce
- Genere e tempo musicali
- Texture di foley (pioggia, folla, macchinari)

Dì cosa tenere e cosa ignorare («abbina il tempo delle percussioni, inventa una nuova melodia»).

## Tre ricette di produzione

### 1) Ad di prodotto (I2V + testo)

Input: still hero del prodotto, plate lifestyle opzionale, script di 40-80 parole con note di camera.
Obiettivo: prodotto leggibile, un'azione chiara, audio che vende il momento.
Tip: metti il prodotto nel primo e nell'ultimo secondo del brief così il framing non deriva.

### 2) Short di personaggio (multi-immagine + testo)

Input: 2-3 still coerenti del personaggio, nota di wardrobe, immagine di location.
Obiettivo: stesso volto e outfit tra gli shot.
Tip: se l'identità deriva, riduci i personaggi simultanei prima di allungare il prompt.

### 3) Social cut guidato dalla musica (audio + testo o R2V)

Input: music bed o SFX bed, marker di beat nel testo («hit sullo snare allo spin»).
Obiettivo: gli accenti di motion atterrano sugli accenti audio.
Tip: genera due durate (es. 5s e 10s) e scegli quella che respira.

## Controllabilità: extend ed edit invece di ricominciare

Quando l'80 % di una take funziona, non bruciare crediti rigenerando da zero. Usa l'extension per continuare, o prompt di edit per cambiare un beat (scambia l'azione finale, tieni il wardrobe). I materiali ufficiali spingono questi flow come punti di forza centrali della 2.0.

Loop stabile:

1. Draft su Fast o Mini per la struttura
2. Blocca prompt + riferimenti
3. Pass finale su Seedance 2.0 standard
4. Estendi solo la take keeper
5. Chiudi testo, colore e loudness in un NLE

## Igiene del prompt che riduce i retry

- Nomina il soggetto una volta, poi riusa la stessa etichetta («il corriere in arancione»)
- Preferisci verbi concreti agli aggettivi
- Limita il numero di trucchi di camera simultanei
- Indica cosa deve restare silenzioso se vuoi ASMR o bed solo dialogo
- Tieni il testo a schermo fuori dal modello quando possibile; composita dopo

## Diritti e safety

Gli upload di riferimento possono includere volti, loghi e musica. Il successo tecnico non è autorizzazione legale. Preferisci stock licenziato, personaggi sintetici o talent che controlli. Gli host possono richiedere controlli di identità per likeness di persone reali.

## FAQ

### Con quanti riferimenti inizio?

Inizia con un'immagine forte o nessuna. Aggiungi riferimenti solo quando compare un failure mode (deriva del volto, location sbagliata, audio piatto). Più input possono aiutare o confondere.

### Perché la mia clip multi-shot sembra casuale?

Di solito manca l'ordine degli shot. Numera i beat. Aggiungi transizioni («cut to», «camera holds», «match on action»).

### Ogni progetto deve usare generazione audio?

No. Loop silenziosi e B-roll da template possono costare meno senza. Usa audio nativo quando energia labiale, foley o timing musicale fanno parte del deliverable.

### Seedance 2.0 può sostituire un editor?

No. Sostituisce la sindrome della timeline vuota. Continui a scegliere le take, sistemare il pace e spedire export sicuri per le piattaforme.

### Qual è il modo più veloce per imparare il modello?

Scegli una ricetta (ad di prodotto o short di personaggio). Genera 10 variazioni con gli stessi riferimenti cambiando solo una variabile del prompt alla volta.

## Chiusura

Tratta Seedance 2.0 come un junior director con stamina perfetta e gusto imperfetto. Daglie shot ordinati, riferimenti puliti e poche hard constraint. Risparmia la fedeltà hero per il pass finale. Il workflow, non lo slogan, è ciò che fa sembrare il modello costoso su una timeline reale.

## Fonti

Fonti primarie per le capacità del modello e il contesto tecnico.

- [Seedance 2.0 official launch](https://seed.bytedance.com/blog/seedance-2-0-official-launch)
- [Seedance 2.0 research paper](https://arxiv.org/abs/2604.14148)

## Letture correlate

- [Funzionalità di Seedance 2.0: cosa fa davvero il modello video di ByteDance](/blog/seedance-2-0-features-overview) — input, durata, risoluzione e limiti onesti.
- [Seedance 2.0 Fast vs Mini: quale modello per bozze, volume e finali?](/blog/seedance-2-0-fast-vs-mini) — scegli il tier per esplorazione vs master cliente.

## Provalo su Seedance 2.5

Metti in pratica il playbook nel [generatore video AI](/generate): shot ordinati, riferimenti e iterazioni brevi nel prodotto.
`,
    },
    pl: {
      title:
        'Workflowy kreatywne Seedance 2.0: prompty, referencje i kontrola multi-shot',
      description:
        'Jak prowadzić Seedance 2.0 jak short-form reżyser: shot lista, referencje multimodalne, audio, extension i pętla iteracji.',
      content: `Same specyfikacje zaprowadzą Cię tylko tak daleko. Większość nieudanych ujęć Seedance 2.0 wynika ze słabych briefów, a nie z tego, że „model jest zepsuty”. Ten artykuł to roboczy playbook dla wejść tekstu, obrazu, audio i wideo — z pętlą iteracji, którą powtórzysz na każdym hoście udostępniającym rodzinę 2.0.

## Zacznij od listy ujęć, nie od zdania o vibe

Jednowierszowy mood prompt („cinematic rainy street, emotional”) zmusza model do wymyślania struktury. Lepiej: napisz klip jako 3–6 beatów.

Przykładowy szkielet:

1. Opening insert (obiekt lub otoczenie, 1–2s)
2. Wejście postaci z jasną akcją
3. Interakcja lub moment produktowy
4. Reakcja / payoff
5. Opcjonalna klatka końcowa brand lub text-safe

Seedance 2.0 lepiej ogarnia sekwencje multi-shot, gdy prompt nazywa ruchy kamery i timing. Pożyczaj język filmowy: low angle, push-in, whip pan, insert, two-shot. Nie potrzebujesz idealnego żargonu — potrzebujesz uporządkowanych zdarzeń.

## Multimodalny stack, który naprawdę pomaga

### Obrazy

Używaj obrazów, gdy tożsamość lub layout muszą zostać stabilne:

- Character sheet lub czysty portret
- Plate lokalizacji
- Klatki storyboardu
- Packshot produktu z czytelną sylwetką

Unikaj zatłoczonych kolaży. Jedno zadanie na obraz. Jeśli host wspiera oznaczone referencje (@Image 1), używaj etykiet w prompcie.

### Referencje wideo

Krótkie referencje ruchu biją długie. Podaj klip, gdy potrzebujesz:

- ścieżki kamery
- rytmu ciała (taniec, sport)
- tempa montażu

Trzymaj łączną długość referencji wideo w limicie hosta (często około 15 sekund łącznie).

### Referencje audio

Audio łatwo niedocenić. Próbka 3–8 sekund może zablokować:

- barwę głosu
- gatunek i tempo muzyki
- teksturę foley (deszcz, tłum, maszyny)

Powiedz, co zachować, a co zignorować („dopasuj tempo perkusji, wymyśl nową melodię”).

## Trzy przepisy produkcyjne

### 1) Reklama produktu (I2V + tekst)

Wejścia: hero still produktu, opcjonalny lifestyle plate, skrypt 40–80 słów z notatkami kamerowymi.
Cel: czytelny produkt, jedna jasna akcja, audio, które sprzedaje moment.
Tip: umieść produkt w pierwszej i ostatniej sekundzie briefu, by framing nie dryfował.

### 2) Short postaci (multi-image + tekst)

Wejścia: 2–3 spójne still postaci, nota o garderobie, obraz lokalizacji.
Cel: ta sama twarz i outfit między ujęciami.
Tip: jeśli tożsamość dryfuje, najpierw zmniejsz liczbę jednoczesnych postaci, zanim wydłużysz prompt.

### 3) Social cut prowadzony muzyką (audio + tekst lub R2V)

Wejścia: music bed lub SFX bed, markery beatów w tekście („hit na snare przy spinie”).
Cel: akcenty ruchu lądują na akcentach audio.
Tip: generuj dwie długości (np. 5s i 10s) i wybierz tę, która oddycha.

## Sterowalność: extend i edit zamiast restartu

Gdy 80 % ujęcia działa, nie spalaj kredytów regenerując od zera. Użyj extension, by kontynuować, lub promptów edit, by zmienić jeden beat (zamień końcową akcję, zachowaj garderobę). Oficjalne materiały pozycjonują te flow jako kluczowe siły 2.0.

Stabilna pętla:

1. Draft na Fast lub Mini pod strukturę
2. Zablokuj prompt + referencje
3. Final pass na standard Seedance 2.0
4. Extend tylko keeper take
5. Dokończ tekst, kolor i głośność w NLE

## Higiena promptu, która zmniejsza retry

- Nazwij podmiot raz, potem używaj tej samej etykiety („kurier w pomarańczowym”)
- Preferuj konkretne czasowniki zamiast przymiotników
- Ogranicz liczbę równoczesnych trików kamerowych
- Określ, co ma zostać ciche przy ASMR lub bedach tylko z dialogiem
- Trzymaj tekst na ekranie poza modelem, gdy to możliwe; composituj później

## Prawa i safety

Uploady referencji mogą zawierać twarze, logo i muzykę. Sukces techniczny to nie zgoda prawna. Preferuj licencjonowany stock, syntetyczne postacie lub talent, który kontrolujesz. Hosty mogą wymagać weryfikacji tożsamości dla likeness realnych osób.

## FAQ

### Od ilu referencji zacząć?

Zacznij od jednego mocnego obrazu albo od zera. Dodawaj referencje tylko, gdy pojawia się failure mode (dryf twarzy, zła lokalizacja, płaskie audio). Więcej wejść może pomóc lub zmylić.

### Dlaczego mój klip multi-shot wygląda losowo?

Zwykle brakuje kolejności ujęć. Numeruj beaty. Dodaj przejścia („cut to”, „camera holds”, „match on action”).

### Czy każdy projekt powinien używać generacji audio?

Nie. Ciche pętle i szablonowy B-roll bywają tańsze bez niej. Używaj natywnego audio, gdy energia warg, foley lub timing muzyki są częścią deliverable.

### Czy Seedance 2.0 zastąpi montażystę?

Nie. Zastępuje syndrom pustej timeline. Nadal wybierasz ujęcia, poprawiasz tempo i wysyłasz bezpieczne eksporty pod platformy.

### Jaki jest najszybszy sposób nauczenia się modelu?

Wybierz jeden przepis (reklama produktu lub short postaci). Wygeneruj 10 wariantów z tymi samymi referencjami i zmieniaj tylko jedną zmienną promptu naraz.

## Zamknięcie

Traktuj Seedance 2.0 jak junior directora z idealną wytrzymałością i niedoskonałym gustem. Daj mu uporządkowane ujęcia, czyste referencje i małą liczbę twardych ograniczeń. Hero fidelity zostaw na final pass. Workflow, nie slogan, sprawia, że model wygląda drogo na prawdziwej timeline.

## Źródła

Źródła pierwotne dotyczące możliwości modelu i kontekstu technicznego.

- [Seedance 2.0 official launch](https://seed.bytedance.com/blog/seedance-2-0-official-launch)
- [Seedance 2.0 research paper](https://arxiv.org/abs/2604.14148)

## Powiązane artykuły

- [Funkcje Seedance 2.0: co naprawdę potrafi model wideo ByteDance](/blog/seedance-2-0-features-overview) — wejścia, czas trwania, rozdzielczość i uczciwe limity.
- [Seedance 2.0 Fast vs Mini: który model do draftów, wolumenu i finali?](/blog/seedance-2-0-fast-vs-mini) — wybierz poziom do eksploracji vs masterów dla klienta.

## Wypróbuj w Seedance 2.5

Wdróż playbook w [generatorze wideo AI](/generate): uporządkowane ujęcia, referencje i krótkie iteracje w produkcie.
`,
    },
    ko: {
      title:
        'Seedance 2.0 크리에이티브 워크플로: 프롬프트, 레퍼런스, 멀티샷 제어',
      description:
        'Seedance 2.0을 숏폼 디렉터처럼 쓰는 법. 샷 리스트, 멀티모달 레퍼런스, 오디오 큐, 확장과 반복 루프.',
      content: `스펙만으로는 한계가 있습니다. 실패한 Seedance 2.0 테이크의 대부분은 "모델이 고장"이 아니라 약한 브리프에서 옵니다. 애매한 무드 한 문장, 참조 과다 적재, 카메라 순서가 없는 멀티샷—이것들이 크레딧을 녹이는 전형입니다. 이 글은 텍스트·이미지·오디오·비디오 입력을 위한 실무 플레이북이며, 2.0 패밀리를 노출하는 어떤 호스트에서도 반복할 수 있는 반복 루프를 포함합니다.

목표는 "한 번에 완벽"이 아니라 "재현 가능한 개선"입니다. 같은 참조로 변수 하나만 바꾸고, 승리 패턴을 팀이 공유할 수 있게 만드세요.

## 분위기 한 문장이 아니라 샷 리스트로 시작

한 줄 무드 프롬프트("cinematic rainy street, emotional")는 모델에게 구조를 발명하도록 강요합니다. 더 나은 방법: 클립을 3–6개 비트로 씁니다. Seedance 2.0은 멀티샷을 다루지만, 순서가 없으면 "예쁘지만 의미 없는 연속 컷"이 되기 쉽습니다.

예시 골격:

1. 오프닝 인서트(물체 또는 환경, 1–2초)
2. 명확한 액션이 있는 캐릭터 등장
3. 상호작용 또는 제품 순간
4. 반응 / 페이오프
5. 선택적 브랜드 또는 텍스트 세이프 엔드 프레임

Seedance 2.0은 프롬프트가 카메라 무브와 타이밍을 이름 지을 때 멀티샷을 더 깔끔하게 다룹니다. 영화 언어를 빌려 쓰세요: low angle, push-in, whip pan, insert, two-shot. 완벽한 전문 용어는 필요 없고, 순서 있는 사건이 필요합니다.

조금 더 구체화한 예(EC용 10초):

1. 0–2초: 흰 배경 팩샷, 정면 약간 하이앵글
2. 2–5초: 손이 제품을 들어 올리고 라벨이 읽히는 각도로 회전
3. 5–8초: 사용 장면 미디엄(라이프스타일 참조에 맞춤)
4. 8–10초: 제품으로 돌아와 정지. 로고는 후합성 전제로 화면 텍스트는 모델이 쓰지 않게

약한 프롬프트와의 차이는 형용사 양이 아니라 "누가·무엇을·어떤 순서로"가 고정됐는지입니다.

## 실제로 도움이 되는 멀티모달 스택

### 이미지

정체성이나 레이아웃이 안정적이어야 할 때 이미지를 씁니다.

- 캐릭터 시트 또는 깔끔한 초상
- 로케이션 플레이트
- 스토리보드 프레임
- 실루엣이 읽히는 제품 팩샷

복잡한 콜라주는 피하세요. 이미지당 일 하나. 호스트가 라벨 참조(@Image 1)를 지원하면 프롬프트에 라벨을 쓰세요. 예: "@Image1의 얼굴과 헤어 유지. @Image2의 키친 배경. @Image3의 파란 병 실루엣을 처음과 끝에 보여 줄 것"처럼 역할을 문장으로 할당합니다.

실패하기 쉬운 이미지 사용:

- 한 장에 여러 캐릭터·로고·풍경을 몰아넣기
- 저해상·강노이즈 얼굴 사진만 전달
- 의상이 크게 다른 샷을 "동일 인물"로 섞기

### 비디오 참조

짧은 모션 참조가 긴 것보다 낫습니다. 다음이 필요할 때 클립을 넣습니다.

- 카메라 경로
- 몸 리듬(댄스, 스포츠)
- 편집 페이스

결합 비디오 참조 길이는 호스트 한도 안(보통 클립 합쳐 약 15초 근처). 긴 참조를 통째로 넣기보다 원하는 동작 3–6초를 잘라 쓰는 편이 제어하기 쉽습니다. "카메라는 참조를 따르고, 의상과 장소는 이미지 참조를 따를 것"처럼 무엇을 인용할지 언어화하세요.

### 오디오 참조

오디오는 쉽게 과소사용됩니다. 3–8초 샘플로 다음을 고정할 수 있습니다.

- 보이스 팀버
- 음악 장르와 템포
- 폴리 질감(비, 군중, 기계)

무엇을 유지하고 무시할지 말하세요("퍼커션 템포에 맞추고, 멜로디는 새로"). 저작권 있는 히트곡을 올리기 전에 권리를 확인하고, 가능하면 라이선스 베드나 오리지널을 쓰세요. 네이티브 오디오가 얇게 들리면 저가 티어 재시도보다 표준 2.0 재생성 또는 NLE 교체를 검토합니다.

## 세 가지 제작 레시피

### 1) 제품 광고(I2V + 텍스트)

입력: 히어로 제품 스틸, 선택적 라이프스타일 플레이트, 카메라 노트 포함 40–80단어 스크립트.
목표: 읽히는 제품, 명확한 한 액션, 순간을 파는 오디오.
팁: 프레이밍 드리프트를 막으려면 브리프 첫 초와 마지막 초에 제품을 넣으세요.

추가 실무 팁:

- 라벨 글자는 모델이 그리게 하지 말고 후합성 전제
- 반사가 강한 소재는 "소프트 스튜디오 조명"을 명시해 하이라이트 노이즈 억제
- 5초와 10초를 둘 다 만들어 SNS용과 LP용을 분리
- 초안은 Mini/Fast, 클라이언트 제출만 표준 2.0

### 2) 캐릭터 쇼트(다중 이미지 + 텍스트)

입력: 일관된 캐릭터 스틸 2–3장, 의상 노트, 로케이션 이미지.
목표: 샷 간 같은 얼굴과 의상.
팁: 정체성이 드리프트하면 프롬프트를 늘리기 전에 동시 캐릭터 수를 줄이세요.

추가 실무 팁:

- 정면·사선·상반신 등 앵글이 다른 참조를 2–3장으로 제한
- "주황 배달원"처럼 고유 라벨을 한 번 정의하고 이후 그 라벨만 사용
- 두 번째 인물이 필요하면 먼저 1인 키퍼를 잡고 별 클립에서 엮는 편이 안전할 수 있음
- 의상 색은 색 이름을 고정("가끔 빨간 모자" 같은 모호함 금지)

### 3) 음악 주도 소셜 컷(오디오 + 텍스트 또는 R2V)

입력: 뮤직 베드 또는 SFX 베드, 텍스트 비트 마커("스핀에서 스네어에 히트").
목표: 모션 악센트가 오디오 악센트에 착지.
팁: 두 길이(예: 5초와 10초)를 생성하고 숨 쉬는 쪽을 고르세요.

추가 실무 팁:

- 비트 위치를 초 단위로 쓰기("2.0초에 손 들기", "4.5초에 컷")
- 댄스는 짧은 비디오 참조 + 오디오 참조 병행이 잘 먹히는 편
- 완성 후 반드시 헤드폰으로 듣고 얇은 하이햇·찌그러진 저음 확인
- 브랜드 세이프 무음 버전도 함께 남기면 2차 활용이 쉬움

## 제어성: 처음부터 다시 하지 말고 extend와 edit

테이크의 80%가 되면 크레딧을 제로 재생성으로 태우지 마세요. 이어가기는 익스텐션, 한 비트 변경은 편집 프롬프트(엔딩 액션 교체, 의상 유지). 공식 자료는 이를 2.0의 핵심 강점으로 밀고 있습니다.

안정 루프:

1. 구조는 Fast 또는 Mini로 드래프트
2. 프롬프트 + 참조 잠금
3. 최종 패스는 표준 Seedance 2.0
4. 키퍼 테이크만 연장
5. 텍스트·색·라우드니스는 NLE에서 마무리

언제 처음부터 다시 할까:

- 얼굴이 다른 사람 수준으로 붕괴
- 샷 순서가 브리프와 무관
- 제품 실루엣이 읽히지 않음

언제 Edit/Extend로 충분할까:

- 전반은 좋고 엔딩만 약함
- 카메라는 좋은데 액션 하나만 바꾸고 싶음
- 길이를 2–4초만 늘리고 싶음

## 재시도를 줄이는 프롬프트 위생

- 주체를 한 번 이름 짓고 같은 라벨 재사용("주황색 배달원")
- 형용사보다 구체적 동사("아름답다"보다 "상자를 두 손으로 들어 올린다")
- 동시 카메라 트릭 수에 상한(한 클립에 푸시인+휩 팬+크레인은 과함)
- ASMR이나 대화 전용 베드면 무엇이 침묵해야 하는지 명시
- 화면 텍스트는 가능하면 모델 밖에서 나중에 합성
- 네거티브 조건도 짧게("불필요한 인물 늘리지 말 것", "로고 변형 금지")
- 한 번의 변경에서 건드릴 변수는 하나(길이·카메라·참조·대사 톤을 동시에 바꾸지 말 것)

체크리스트로 만들면 팀에서도 재현됩니다. 생성 전 "샷 번호가 있는가 / 참조 역할이 적혀 있는가 / 화면 글자를 모델에 맡기지 않았는가" 세 가지만 확인해도 실패율이 내려갑니다.

## 권리와 세이프티

참조 업로드에는 얼굴, 로고, 음악이 포함될 수 있습니다. 기술 성공은 법적 클리어런스가 아닙니다. 라이선스 스톡, 합성 캐릭터, 통제 가능한 탤런트를 선호하세요. 호스트는 실존 인물 닮은 모습에 신원 확인을 요구할 수 있습니다.

실무 규칙 예:

- 유명인·타인의 얼굴 사진을 "닮게" 쓰기 전 법무 확인
- 클라이언트 경쟁사 로고가 비치지 않는지 확인
- 음악 참조는 권리 클리어된 것만
- 사내 리뷰용과 외부 공개용 품질 게이트를 분리

## FAQ

### 참조는 몇 개부터?

강한 이미지 한 장 또는 없음으로 시작. 실패 모드(얼굴 드리프트, 잘못된 장소, 납작한 오디오)가 나타날 때만 추가. 입력이 많을수록 도움이 될 수도, 혼란스러울 수도 있습니다. "일단 상한까지"는 재현성을 떨어뜨리기 쉽습니다.

### 멀티샷 클립이 무작위처럼 느껴지는 이유?

보통 샷 순서 부재입니다. 비트에 번호를 매기고, 전환을 추가하세요("cut to", "camera holds", "match on action"). 여전히 흩어지면 동시 이벤트 수를 줄이고 한 샷 한 액션으로 분해하세요.

### 모든 프로젝트에 오디오 생성을 써야 하나요?

아니요. 무음 루프와 템플릿 B-roll은 없이 더 쌀 수 있습니다. 립 에너지, 폴리, 음악 타이밍이 납품물의 일부일 때 네이티브 오디오를 쓰세요. 고민되면 같은 프롬프트로 오디오 on/off를 한 번씩 비교해 비용 차와 품질 차를 재세요.

### Seedance 2.0이 에디터를 대체할 수 있나요?

아니요. 빈 타임라인 증후군을 대체합니다. 테이크 선택, 페이스 수정, 플랫폼 안전 내보내기는 여전히 사람이 합니다. AI는 "소재 양산 장치", 에디터는 "의미와 브랜드의 최종 책임"으로 역할을 나누는 것이 현실적입니다.

### 모델을 배우는 가장 빠른 방법은?

레시피 하나(제품 광고 또는 캐릭터 쇼트)를 고르세요. 같은 참조로 10변주를 만들고 한 번에 프롬프트 변수 하나만 바꾸세요. 기록표에 "바꾼 점 / 결과 / 다음 가설"을 남기면 일주일 만에 팀의 실패 패턴이 공유 자산이 됩니다.

### Fast나 Mini로 초안을 만든 뒤 표준 2.0으로 올려야 하나요?

많은 작업에서는 예입니다. 구조가 안 잡힌 상태에서 표준 2.0을 연타하면 단가만 올라갑니다. 탐색은 싼 미터, 믿는 테이크에만 비싼 초가 기본입니다. 자세한 비교는 Fast vs Mini 가이드를 보세요.

## 마무리

Seedance 2.0을 스태미나는 완벽하고 취향은 불완전한 주니어 디렉터처럼 다루세요. 정렬된 샷, 깨끗한 참조, 소수의 강한 제약을 주고, 히어로 충실도는 최종 패스에 남겨 두세요. 슬로건이 아니라 워크플로가 진짜 타임라인에서 모델을 비싸 보이게 만듭니다.

다음 액션은 작아도 됩니다. 오늘 작업에서 샷 리스트를 5줄 쓰고, 참조를 한 장으로 줄이고, Mini 또는 Fast로 3개만 돌려 보세요. 그 로그가 다음 표준 2.0 키퍼의 토대가 됩니다.

## 출처

모델 기능과 기술적 배경을 확인할 수 있는 주요 출처입니다.

- [Seedance 2.0 official launch](https://seed.bytedance.com/blog/seedance-2-0-official-launch)
- [Seedance 2.0 research paper](https://arxiv.org/abs/2604.14148)

## 관련 글

- [Seedance 2.0 기능 정리: 바이트댄스 비디오 모델이 실제로 하는 일](/blog/seedance-2-0-features-overview) — 입력, 길이, 해상도와 솔직한 한계.
- [Seedance 2.0 Fast vs Mini: 드래프트·대량·최종본에 무엇을 쓸까](/blog/seedance-2-0-fast-vs-mini) — 탐색용과 납품용 티어 선택.

## Seedance 2.5에서 바로 시도

[AI 비디오 생성기](/generate)에서 플레이북을 실행하세요: 정렬된 샷, 레퍼런스, 짧은 반복을 제품 안에서.
`,
    },
    ja: {
      title:
        'Seedance 2.0クリエイティブ・ワークフロー：プロンプト、参照、マルチショット制御',
      description:
        'Seedance 2.0をショートフォームの監督のように使う方法。ショットリスト、マルチモーダル参照、音声、延長、反復ループ。',
      content: `スペックだけでは足りません。Seedance 2.0の失敗テイクの多くは「モデルが壊れている」からではなく、弱いブリーフから来ます。曖昧なムード一文、参照の詰め込みすぎ、カメラ順のないマルチショット——これらがクレジットを溶かす典型パターンです。本稿はテキスト・画像・音声・動画入力の実務プレイブックで、2.0ファミリーを公開しているホストならどこでも繰り返せる反復ループ付きです。

ゴールは「一発で完璧」ではなく、「再現可能な改善」です。同じ参照で変数を1つだけ変え、勝ちパターンをチームで共有できるようにします。

## 雰囲気の一文ではなくショットリストから始める

一行のムードプロンプト（「cinematic rainy street, emotional」）は、モデルに構造を発明させます。より良いやり方は、クリップを3〜6ビートで書くことです。Seedance 2.0はマルチショットを扱えますが、順序が書かれていなければ「きれいだが意味のない連続カット」になりやすいです。

例の骨格：

1. オープニング・インサート（物や環境、1〜2秒）
2. 明確なアクションでのキャラ入場
3. 相互作用またはプロダクトの瞬間
4. リアクション／ペイオフ
5. 任意のブランド／テキスト安全なエンドフレーム

Seedance 2.0は、プロンプトがカメラワークとタイミングを名指しするとき、マルチショットをよりきれいに扱います。映画言語を借りてください：low angle、push-in、whip pan、insert、two-shot。完璧な専門用語は不要で、順序立った出来事が必要です。

もう少し具体化した例（EC向け10秒）：

1. 0–2秒：白い背景のパックショット、正面やや俯瞰
2. 2–5秒：手が製品を持ち上げ、ラベルが読める角度へ回転
3. 5–8秒：使用シーンのミディアム（ライフスタイル参照に合わせる）
4. 8–10秒：製品に戻り静止。ロゴは後合成前提で画面内テキストは書かせない

弱いプロンプトとの差は形容詞の多さではなく、「誰が・何を・どの順で」が固定されているかです。

## 本当に効くマルチモーダル・スタック

### 画像

同一性やレイアウトを安定させたいときに画像を使います。

- キャラクターシートまたはきれいなポートレート
- ロケーションプレート
- ストーリーボードのフレーム
- シルエットが読める製品パックショット

ごちゃついたコラージュは避ける。1画像1仕事。ホストがラベル付き参照（@Image 1）をサポートするなら、プロンプトでラベルを使う。例えば「@Image1の顔と髪型を維持。@Image2のキッチン背景。@Image3の青いボトルのシルエットを最初と最後に見せる」のように、役割を文章で割り当てます。

失敗しやすい画像の使い方：

- 1枚に複数キャラとロゴと風景を詰め込む
- 低解像・強ノイズの顔写真だけを渡す
- 衣装が大きく違うショットを「同一人物」として混在させる

### 動画参照

短いモーション参照が長いものに勝ります。次が必要なときにクリップを渡します。

- カメラパス
- 身体のリズム（ダンス、スポーツ）
- 編集のペース

動画参照の合計尺はホスト上限内に（多くの場合クリップ合計でおおよそ15秒前後）。長い参照を丸ごと入れるより、欲しい動きの3〜6秒を切り出す方が制御しやすいです。「カメラだけ真似て、衣装と場所は画像参照に従う」のように、何を引用するかを言語化してください。

### 音声参照

音声は軽視されがちです。3〜8秒のサンプルで次を固定できます。

- 声の音色
- 音楽ジャンルとテンポ
- フォーリーの質感（雨、群衆、機械）

何を保ち何を無視するかを言う（「パーカッションのテンポに合わせ、メロディは新規で」）。著作権のあるヒット曲をそのまま上げる前に権利を確認し、可能ならライセンス済みベッドやオリジナルを使います。ネイティブ音声が薄いと感じたら、安いティアではなく標準2.0の再生成か、NLEでの差し替えを検討します。

## 3つの制作レシピ

### 1) プロダクト広告（I2V + テキスト）

入力：ヒーロー製品スチール、任意のライフスタイルプレート、カメラメモ付き40〜80語のスクリプト。
目標：読める製品、明確な1アクション、瞬間を売る音声。
ヒント：フレーミングのドリフトを防ぐため、ブリーフの最初と最後の1秒に製品を置く。

追加の実務Tips：

- ラベル文字はモデルに描かせず、後合成を前提にする
- 反射の強い素材は「ソフトなスタジオ光」と明記してハイライトのノイズを抑える
- 5秒と10秒を両方生成し、SNS用とLP用を分ける
- 下書きはMini/Fast、クライアント提出用のみ標準2.0

### 2) キャラクター・ショート（複数画像 + テキスト）

入力：一貫したキャラ静止画2〜3枚、衣装メモ、ロケーション画像。
目標：ショット間で同じ顔と衣装。
ヒント：同一性がドリフトしたら、プロンプトを長くする前に同時キャラ数を減らす。

追加の実務Tips：

- 正面・斜め・上半身などアングルの違う参照を2〜3枚に抑える
- 「オレンジの配達員」のように固有ラベルを一度定義し、以降はそのラベルだけを使う
- 2人目が必要なら、先に1人でキーパーを取り、別クリップで絡める方が安全なこともある
- 衣装色は色名を固定（「ときどき赤い帽子」のような曖昧さを避ける）

### 3) 音楽主導のソーシャルカット（音声 + テキストまたはR2V）

入力：ミュージックベッドまたはSFXベッド、テキスト内のビートマーカー（「スピンでスネアにヒット」）。
目標：モーションのアクセントが音声のアクセントに着地する。
ヒント：2つの尺（例：5秒と10秒）を生成し、息のある方を選ぶ。

追加の実務Tips：

- ビート位置を秒数で書く（「2.0秒で手を上げる」「4.5秒でカット」）
- ダンスは短い動画参照＋音声参照の併用が効きやすい
- 完成後は必ずヘッドホンで聴き、薄いハイハットや歪んだ低音がないか確認
- ブランドセーフな無音版も同時に残すと二次利用が楽

## 制御性：ゼロからやり直さずExtendとEdit

テイクの80%が機能しているなら、クレジットをゼロ再生成で燃やさない。続きはエクステンション、1ビートの変更は編集プロンプト（終わりのアクションを入れ替え、衣装は維持）。公式資料はこれらを2.0の中核的強みとして推しています。

安定ループ：

1. 構造はFastまたはMiniでドラフト
2. プロンプト＋参照をロック
3. 最終パスは標準Seedance 2.0
4. キーパーテイクだけを延長
5. テキスト・色・ラウドネスはNLEで仕上げ

いつゼロからやり直すか：

- 顔が別人物レベルで崩れている
- ショット順がブリーフと無関係
- 製品シルエットが読めない

いつEdit/Extendで足りるか：

- 前半は良く終わりだけ弱い
- カメラは良いが1アクションだけ変えたい
- 尺を2〜4秒だけ伸ばしたい

## リトライを減らすプロンプト衛生

- 被写体は一度名付け、同じラベルを再利用（「オレンジの配達員」）
- 形容詞より具体的な動詞（「美しい」より「箱を両手で持ち上げる」）
- 同時カメラトリックの数に上限（1クリップにプッシュイン＋ホイップパン＋クレーンは盛りすぎ）
- ASMRや対話のみのベッドが欲しいとき、何を無音にするか明記
- 画面内テキストは可能な限りモデル外で後から合成
- ネガティブ条件も短く（「余計な人物を増やさない」「ロゴを変形させない」）
- 1回の変更で触る変数は1つ（尺・カメラ・参照・台詞トーンを同時に変えない）

チェックリスト化するとチームでも再現できます。生成前に「ショット番号があるか／参照の役割が書いてあるか／画面内文字をモデルに任せていないか」の3点だけ確認するだけでも失敗率が下がります。

## 権利とセーフティ

参照アップロードには顔、ロゴ、音楽が含まれ得ます。技術的成功は法的クリアランスではありません。ライセンス済みストック、合成キャラ、管理下のタレントを優先。ホストは実在人物の似姿に本人確認を求める場合があります。

実務ルールの例：

- 有名人・他人の顔写真を「似せて」使う前に法務確認
- クライアントの競合ロゴが映り込まないか確認
- 音楽参照は権利クリア済みのみ
- 社内レビュー用と外部公開用で品質ゲートを分ける

## FAQ

### 参照はいくつから始める？

強い画像1枚かゼロから。失敗モード（顔ドリフト、場所違い、平板な音）が出たときだけ追加。入力が多いほど助けにも混乱にもなります。「とりあえず上限まで」は再現性を下げやすいです。

### マルチショットがランダムに感じるのはなぜ？

多くはショット順の欠落です。ビートに番号を振る。「cut to」「camera holds」「match on action」などのトランジションを足す。まだ散らつくなら、同時に起こるイベント数を減らし、1ショット1アクションに分解してください。

### すべての案件で音声生成を使うべき？

いいえ。サイレントループやテンプレBロールは無しの方が安いことがあります。リップのエネルギー、フォーリー、音楽タイミングが納品物の一部ならネイティブ音声を。迷ったら同じプロンプトで音声あり／なしを1本ずつ比べ、コスト差と品質差を測ります。

### Seedance 2.0は編集者を置き換えられる？

いいえ。空のタイムライン症候群を置き換えます。テイク選び、ペース修正、プラットフォーム安全な書き出しは依然として人が行います。AIは「素材の量産装置」、編集者は「意味とブランドの最終責任」と役割分担するのが現実的です。

### モデルを学ぶ最速の方法は？

レシピを1つ選ぶ（製品広告またはキャラショート）。同じ参照で10バリエーションを生成し、一度にプロンプト変数を1つだけ変える。記録表に「変えた点／結果／次の仮説」を残すと、1週間でチームの失敗パターンが共有資産になります。

### FastやMiniで下書きしてから標準2.0に上げるべき？

多くの案件でははい。構造が通っていない状態で標準2.0を連打すると単価だけ上がります。探索は安いメーター、信じるテイクだけ高い秒数、が基本です。詳細はFast vs Miniガイドを参照してください。

## 結び

Seedance 2.0を、スタミナ完璧・センス不完全なジュニア・ディレクターとして扱ってください。順序立ったショット、きれいな参照、少数の硬い制約を与え、ヒーロー忠実度は最終パスに温存する。スローガンではなくワークフローが、本物のタイムライン上でモデルを「高く見える」ものにします。

次のアクションは小さくて構いません。今日の案件でショットリストを5行書き、参照を1枚に絞り、MiniまたはFastで3本だけ回す。そのログが、次の標準2.0キーパーの土台になります。

## 参考資料

モデルの能力と技術的背景を確認するための一次資料です。

- [Seedance 2.0 official launch](https://seed.bytedance.com/blog/seedance-2-0-official-launch)
- [Seedance 2.0 research paper](https://arxiv.org/abs/2604.14148)

## 関連記事

- [Seedance 2.0の機能まとめ：ByteDanceの動画モデルが実際にできること](/blog/seedance-2-0-features-overview) — 入力・尺・解像度と正直な限界。
- [Seedance 2.0 Fast vs Mini：下書き・量産・最終版にどれを使うか](/blog/seedance-2-0-fast-vs-mini) — 探索用と納品用のティアの選び方。

## Seedance 2.5で試す

プレイブックを[AI動画ジェネレーター](/generate)で実践：順序付きショット、参照、短い反復をプロダクト内で。
`,
    },
  },
};
