#!/usr/bin/env python3
"""Build all_bodies.json with full localized Seedance 2.0 blog bodies."""
from __future__ import annotations

import json
from pathlib import Path

OUT = Path(__file__).resolve().parent / "all_bodies.json"

# ---------------------------------------------------------------------------
# seedance-2-0-features-overview
# ---------------------------------------------------------------------------

features_de = r"""Das Seed-Team von ByteDance hat Seedance 2.0 im Februar 2026 veröffentlicht. Hinter den Launch-Headlines steckt eine nüchterne Frage: Was kann man reingeben, was kommt raus, und wann lohnt sich der Wechsel von älteren Modellen?

Dieser Leitfaden fasst die öffentlich beschriebenen Fähigkeiten von Seedance 2.0 zusammen — ohne Pressetexte. Zahlen können je nach Plattform (Jimeng, CapCut, BytePlus, Drittanbieter-APIs) abweichen. Die Angaben unten sind die gemeinsame Basis aus offiziellen Materialien, kein Garantieschein für jeden Endpoint.

## Was Seedance 2.0 ist

Seedance 2.0 ist ein natives multimodales Audio-Video-Generierungsmodell. Text, Bild, Audio und Video können in derselben Anfrage stecken. Bild und Ton entstehen gemeinsam; Audio wird nicht nur nachträglich angehängt.

Gegenüber Seedance 1.5 Pro legt 2.0 den Fokus stärker auf:

- Bewegung mit besserer physikalischer Plausibilität (vor allem Mehrpersonen-Action)
- Befolgen langer, detaillierter Anweisungen
- Konsistenz von Subjekten bei Referenzmedien
- Stereo-Audio, das zu Bildereignissen passt

Es ist kein Alleskönner. Komplexe Gesichter, winziger Text im Bild und viele Identitäten gleichzeitig können scheitern. Für Multi-Shot-Clips mit Ton ist der Sprung aber spürbar.

## Kombinierbare Inputs

Öffentliche Angaben zur Open Platform nennen typischerweise:

- bis zu 9 Bilder
- bis zu 3 Videoclips
- bis zu 3 Audioclips
- plus natürliche Sprache

Die genauen Limits hängen vom Produkt ab. Das Prinzip bleibt: Look, Szene, Kamera, Bewegung und Klangfarbe lassen sich parallel verankern.

Typische Muster:

- **Nur Text:** Storyboards, Ads, Erklärclips, stilisierte Shorts
- **Image-to-Video:** Startframe (manchmal Endframe) mit Motion-Notes
- **Referenzstark:** Storyboard + Charakter-Stills + Location + Stimme oder Musik
- **Extend / Edit:** einen Clip fortsetzen oder einen Beat ändern, ohne bei null zu starten

## Ausgabe: Länge, Auflösung, Audio

| Spec | Typischer Bereich |
| --- | --- |
| Dauer | etwa 4-15 Sekunden |
| Auflösung | nativ 480p/720p; viele Hosts bis 1080p |
| Audio | zweikanalig, gemeinsam mit dem Video |
| Shots | mehrere Einstellungen in einem Clip |

Audio ist ein echter Unterschied. Dialognahe Performance, Foley, Ambiente und Musik-Cues können auf Bewegungsbeats landen. Das zählt für Ads und Short Drama mehr als für stummes B-Roll.

Bildraten und Seitenverhältnisse hängen vom Host ab. Erwarten Sie gängige Social-Ratios (16:9, 9:16, 1:1).

## Qualitätsmerkmale in der Praxis

### Komplexe Bewegung und Interaktion

Offizielle Demos betonen Mehrpersonen-Sport und Paararbeit. Im Alltag heißt das: weniger „geschmolzene“ Gliedmaßen und besseres Gewicht, wenn zwei Figuren interagieren. Für Gesichter brauchen Sie weiterhin klare Prompts und gute Referenzen.

### Instruction Following

Lange Skripte mit Kamera-Notes („low angle, dann push-in“) funktionieren besser als ein vager Mood-Satz. Behandeln Sie den Prompt wie eine Shotliste, nicht wie ein Gedicht.

### Steuerbarkeit und Extension

Seedance 2.0 wird für Fortsetzung und gezielte Edits positioniert: vom letzten Frame weiterlaufen, eine Action tauschen, einen Beat umschreiben. Nützlich, wenn 80 % eines Takes bereits stimmen.

### Multimodale Referenztiefe

Komposition, Kamerafahrten, Stil und Audio-Charakter lassen sich aus Referenzen „zitieren“. Ein Still-Storyboard plus Charakterfoto ist oft stärker als ein 200-Wörter-Prompt allein.

## Wann Standard-2.0 die richtige Wahl ist

Nutzen Sie die Standard-Stufe, wenn:

- der Clip ein Hero-Shot oder kundenfertiges Final ist
- höhere Treue und Detailtiefe nötig sind
- multimodale Referenzen im Brief zentral sind
- natives Audio bewusst wirken soll, nicht optional

Greifen Sie zu leichteren Familienmitgliedern (Fast / Mini), wenn Sie Prompts iterieren, Timing testen oder hohe Stückzahlen günstiger brauchen. Diese Varianten teilen die multimodale Idee, tauschen aber Finish oder Auflösung gegen Speed und Preis. Details stehen im Fast-vs-Mini-Guide.

## Ehrliche Grenzen

Auch mit starken internen Benchmarks kämpft Seedance 2.0 noch mit:

- winzigem On-Screen-Text und Logos, die lesbar bleiben müssen
- perfekter Multi-Identity-Konsistenz über viele Charaktere
- gelegentlichen Audio-Artefakten bei harter Musik oder Dialekten
- ultra-langen Narrativen (Sie arbeiten weiter in Short-Clips)

Planen Sie Edits. Generieren Sie mehr Takes als Sie veröffentlichen. Achten Sie auf Rechte, wenn echte Gesichter oder urheberrechtlich geschützte Musik als Referenz hochgeladen werden.

## FAQ

### Ist Seedance 2.0 nur Text-to-Video?

Nein. Text-to-Video ist ein Modus. Image-to-Video, Reference-to-Video, audio-aware Generation, Extension und Edit-Workflows gehören zur Produktgeschichte.

### Generiert es Audio automatisch?

Ja auf der Standard-2.0-Linie: Audio und Video entstehen zusammen, inkl. Dual-Channel in offiziellen Materialien. Manche Hosts erlauben Mute oder Austausch.

### Wie lang kann eine einzelne Generation sein?

Die meisten öffentlichen Beschreibungen liegen bei 4-15 Sekunden. Für längere Stories Clips verketten, Extension nutzen oder im NLE schneiden.

### Ist Seedance 2.0 dasselbe wie Seedance 2.5?

Nein. Seedance 2.5 ist eine spätere Produktlinie auf dieser Site. Dieser Artikel behandelt die 2.0-Modellfamilie von ByteDance Seed Anfang 2026.

### Darf ich echte Celebrity-Likeness als Referenz nutzen?

Produktregeln und lokales Recht gelten. Offizielle Demos nutzen oft lizenzierte oder synthetische Subjekte. Technische Möglichkeit ist keine Erlaubnis.

## Fazit

Seedance 2.0 ist am besten als Short-Form-Multimodal-Director zu verstehen: mehrere Medien rein, synchrones Bild und Ton raus, bessere Motion und Kontrolle als die 1.5-Generation. Wenn Ihre Arbeit in 5-15-Sekunden-Beats mit echtem Audio-Bedarf lebt, gehört es auf die Shortlist. Für stille Loops kann ein leichteres oder günstigeres Modell reichen."""

features_fr = r"""L'équipe Seed de ByteDance a publié Seedance 2.0 en février 2026. Au-delà des titres de lancement, la question utile est simple : que peut-on lui donner en entrée, que sort-il, et quand faut-il l'utiliser à la place d'un modèle plus ancien ?

Ce guide couvre les capacités publiques de Seedance 2.0, sans le jargon marketing. Les spécifications varient légèrement selon la plateforme (Jimeng, CapCut, BytePlus, API tierces). Les chiffres ci-dessous constituent la base commune tirée des documents officiels, pas une garantie pour chaque endpoint.

## Ce qu'est Seedance 2.0

Seedance 2.0 est un modèle natif de génération audio-vidéo multimodale. Texte, image, audio et vidéo peuvent coexister dans la même requête. Le modèle a été conçu pour produire image et son ensemble, pas pour coller l'audio après coup.

Par rapport à Seedance 1.5 Pro, la lignée 2.0 insiste davantage sur :

- un mouvement plus souvent compatible avec la physique (surtout l'action multi-personnes)
- le suivi d'instructions longues et détaillées
- la cohérence des sujets lorsque vous fournissez des médias de référence
- un audio stéréo calé sur les événements à l'écran

Ce n'est pas magique. Les visages complexes, le texte minuscule à l'écran et l'identité multi-sujets échouent encore parfois. C'est en revanche un bond clair pour les clips multi-plans qui ont besoin d'image et de son.

## Entrées que vous pouvez combiner

La documentation publique de la plateforme ouverte décrit un budget de référence assez large :

- jusqu'à 9 images
- jusqu'à 3 clips vidéo
- jusqu'à 3 clips audio
- plus des instructions en langage naturel

Les plafonds exacts dépendent de la surface produit. L'idée reste la même partout : vous pouvez verrouiller en une fois le look des personnages, le décor, le langage caméra, le rythme du mouvement et le caractère sonore.

Schémas typiques :

- **Texte seul :** storyboards, pubs, explainer, courts stylisés
- **Image vers vidéo :** image de départ (parfois de fin) avec notes de mouvement
- **Références riches :** storyboard + portraits de personnages + lieux + voix ou musique
- **Extend / edit :** prolonger un clip ou changer un temps fort sans tout regénérer à zéro

## Durée de sortie, résolution et audio

Enveloppe publique courante :

| Spec | Plage typique |
| --- | --- |
| Durée | environ 4-15 secondes |
| Résolution | 480p / 720p en natif ; beaucoup d'hôtes proposent aussi jusqu'à 1080p |
| Audio | double canal, généré avec la vidéo |
| Plans | séquences multi-plans dans un même clip |

L'audio est un vrai différenciateur. Seedance 2.0 peut poser une performance quasi dialoguée, du foley, de l'ambiance et des cues musicaux qui tombent sur les beats de mouvement. Cela compte davantage pour la publicité et le short drama que pour du B-roll silencieux.

Fréquences d'images et ratios dépendent de l'app hôte. Attendez-vous aux ratios sociaux courants (16:9, 9:16, 1:1) sur la plupart des surfaces.

## Traits de qualité qui apparaissent en pratique

### Mouvement complexe et interaction

Les démos officielles insistent sur le sport multi-personnes et le travail en duo (le patinage artistique est l'exemple célèbre). Au quotidien, cela se traduit par moins de membres « fondus » et un meilleur transfert de poids quand deux personnages interagissent. Les visages demandent toujours des prompts clairs et de bonnes références.

### Suivi d'instructions

Les longs scripts avec notes caméra (« low angle sur les lames, puis un push-in pour le portage ») marchent mieux qu'une seule phrase d'ambiance vague. Traitez le prompt comme une liste de plans, pas comme un poème.

### Contrôlabilité et extension

Seedance 2.0 est positionné pour la continuation et les edits ciblés : repartir de la dernière image, échanger une action, réécrire un temps fort. Utile quand vous aimez déjà 80 % d'une prise.

### Profondeur des références multimodales

Composition, mouvements de caméra, style et caractère audio peuvent tous être « cités » depuis des références. Un storyboard fixe plus une photo de personnage est souvent plus fort qu'un prompt de 200 mots seul.

## Où Seedance 2.0 s'insère dans une stack

Utilisez le palier standard Seedance 2.0 lorsque :

- le clip est un hero shot ou un final client
- vous avez besoin d'une fidélité et d'un détail plus forts
- les références multimodales sont centrales au brief
- l'audio natif doit paraître intentionnel, pas optionnel

Tournez-vous vers les membres plus légers de la famille (Fast / Mini) pour itérer les prompts, tester le timing, ou produire en volume à moindre coût. Ces variantes partagent l'idée multimodale mais échangent polish ou résolution contre vitesse et prix. Voir notre guide Fast vs Mini pour le tableau de décision.

## Limites honnêtes

Même avec de bons scores internes, Seedance 2.0 peine encore avec :

- le texte et logos minuscules à l'écran qui doivent rester lisibles
- une cohérence multi-identité parfaite sur beaucoup de personnages
- des artefacts audio occasionnels sur musique dure ou dialectes
- la structure narrative ultra-longue (vous travaillez toujours en clips courts)

Planifiez les edits. Générez plus de prises que vous n'en publiez. Pensez aux droits si vous uploadez de vrais visages ou de la musique protégée comme références.

## FAQ

### Seedance 2.0 n'est-il que du text-to-video ?

Non. Le text-to-video est un mode. Image-to-video, reference-to-video, génération audio-aware, extension et workflows de type edit font partie de l'histoire produit.

### Génère-t-il l'audio automatiquement ?

Oui sur la ligne standard 2.0 : audio et vidéo sont générés ensemble, y compris la sortie dual-channel dans les matériaux officiels. Certains hôtes permettent encore de désactiver ou remplacer l'audio.

### Quelle durée pour une seule génération ?

La plupart des descriptions publiques se situent dans la fenêtre 4-15 secondes. Pour des histoires plus longues, enchaînez des clips avec extension ou outils d'edit, ou montez-les dans un NLE classique.

### Seedance 2.0 est-il identique à Seedance 2.5 ?

Non. Seedance 2.5 est une surface produit / lignée de modèles plus tardive sur ce site. Cet article porte sur la famille de modèles 2.0 publiée par ByteDance Seed début 2026.

### Puis-je utiliser de vraies ressemblances de célébrités en référence ?

Les règles produit et le droit local s'appliquent. Les démos officielles utilisent souvent des sujets licenciés ou synthétiques. Ne confondez pas capacité technique et autorisation.

## En résumé

Seedance 2.0 se comprend mieux comme un réalisateur short-form multimodal : plusieurs types de médias en entrée, image et son synchronisés en sortie, avec un meilleur mouvement et un meilleur contrôle que la génération 1.5. Si votre travail vit en beats de 5-15 secondes avec de vrais besoins audio, il mérite votre shortlist. Si vous n'avez besoin que de boucles silencieuses, un modèle plus léger ou moins cher peut suffire."""

features_es = r"""El equipo Seed de ByteDance lanzó Seedance 2.0 en febrero de 2026. Si solo lees los titulares de lanzamiento, suena a otro «modelo de vídeo de próxima generación». La pregunta útil es más simple: qué puedes introducirle, qué sale y cuándo conviene usarlo en lugar de un modelo anterior.

Esta guía cubre las capacidades públicas de Seedance 2.0, sin relleno de nota de prensa. Las especificaciones varían ligeramente según la plataforma (Jimeng, CapCut, BytePlus, APIs de terceros), así que trata los números de abajo como la base común de materiales oficiales, no como una garantía para cada endpoint.

## Qué es Seedance 2.0

Seedance 2.0 es un modelo nativo de generación multimodal de audio y vídeo. Texto, imagen, audio y vídeo pueden ir en la misma solicitud. El modelo se diseñó para generar imagen y sonido juntos, no para pegar el audio a posteriori.

Respecto a Seedance 1.5 Pro, la línea 2.0 aprieta más en:

- Movimiento que obedece la física con más frecuencia (sobre todo acción multipersona)
- Seguir instrucciones largas y detalladas
- Mantener sujetos consistentes cuando pasas medios de referencia
- Audio estéreo que sigue los eventos en pantalla

No es magia. Caras complejas, texto minúsculo en pantalla e identidad multi-sujeto siguen fallando a veces. Sí es, en cambio, un salto claro para clips multipiano que necesitan imagen y sonido.

## Entradas que puedes combinar

La documentación pública de la plataforma abierta describe un presupuesto de referencias bastante amplio:

- Hasta 9 imágenes
- Hasta 3 clips de vídeo
- Hasta 3 clips de audio
- Más instrucciones en lenguaje natural

Los techos exactos dependen de la superficie de producto. La idea es la misma en todas partes: puedes fijar a la vez el aspecto del personaje, el layout de la escena, el lenguaje de cámara, el ritmo del movimiento y el carácter sonoro.

Patrones típicos:

- **Solo texto:** storyboards, anuncios, explainers, cortos estilizados
- **Imagen a vídeo:** fotograma inicial (a veces final) con notas de movimiento
- **Carga de referencias:** storyboard + stills de personaje + localizaciones + voz o música
- **Extend / edit:** continuar un clip o cambiar un beat sin regenerar todo desde cero

## Duración de salida, resolución y audio

Sobre común pública:

| Spec | Rango típico |
| --- | --- |
| Duración | unos 4-15 segundos |
| Resolución | 480p / 720p nativos; muchos hosts también ofrecen hasta 1080p |
| Audio | doble canal, generado con el vídeo |
| Planos | secuencias multipiano dentro de un clip |

El audio es un diferenciador real. Seedance 2.0 puede poner performance de tipo diálogo, foley, ambiente y cues musicales que caen en los beats de movimiento. Eso importa más en anuncios y short drama que en B-roll mudo.

Las tasas de fotogramas y las relaciones de aspecto dependen de la app anfitriona. Espera ratios sociales habituales (16:9, 9:16, 1:1) en la mayoría de superficies.

## Rasgos de calidad que se ven en la práctica

### Movimiento complejo e interacción

Las demos oficiales destacan deporte multipersona y trabajo en pareja (el patinaje artístico es el ejemplo famoso). En el día a día, eso se traduce en menos extremidades «fundidas» y mejor transferencia de peso cuando interactúan dos personajes. Sigue haciendo falta prompts limpios y buenas referencias para las caras.

### Seguimiento de instrucciones

Los guiones largos con notas de cámara («ángulo bajo en los patines, luego un push-in para el elevación») funcionan mejor que una sola frase de mood vaga. Trata el prompt como una lista de planos, no como un poema.

### Controlabilidad y extensión

Seedance 2.0 se posiciona para continuación y edits dirigidos: seguir desde el último fotograma, cambiar una acción o reescribir un beat. Útil cuando ya te gusta el 80 % de una toma.

### Profundidad de referencia multimodal

Composición, movimientos de cámara, estilo y carácter de audio pueden «citarse» desde referencias. Un storyboard fijo más una foto de personaje suele ser más fuerte que un prompt de 200 palabras solo.

## Dónde encaja Seedance 2.0 en un stack

Usa el nivel estándar de Seedance 2.0 cuando:

- el clip es un hero shot o un final de cara al cliente
- necesitas más fidelidad y detalle
- las referencias multimodales son centrales al brief
- el audio nativo debe sentirse intencional, no opcional

Acude a miembros más ligeros de la familia (Fast / Mini) cuando iteras prompts, pruebas timing o produces alto volumen a menor coste. Esas variantes comparten la idea multimodal pero intercambian polish o resolución por velocidad y precio. Consulta nuestra guía Fast vs Mini para la tabla de decisión.

## Límites honestos

Incluso con buenas puntuaciones internas, Seedance 2.0 sigue luchando con:

- texto y logos minúsculos en pantalla que deben seguir legibles
- consistencia multi-identidad perfecta en muchos personajes
- artefactos de audio ocasionales en música dura o dialectos
- estructura narrativa ultra larga (sigues trabajando en clips cortos)

Planifica edits. Genera más tomas de las que publicas. Ten en cuenta la cesión de derechos si subes caras reales o música con copyright como referencias.

## FAQ

### ¿Seedance 2.0 es solo text-to-video?

No. Text-to-video es un modo. Image-to-video, reference-to-video, generación con conciencia de audio, extensión y flujos tipo edit forman parte de la historia del producto.

### ¿Genera audio automáticamente?

Sí en la línea estándar 2.0: audio y vídeo se generan juntos, incluida la salida de doble canal en materiales oficiales. Algunos hosts aún permiten desactivar o reemplazar el audio.

### ¿Cuánto puede durar una sola generación?

La mayoría de las descripciones públicas caen en la ventana de 4-15 segundos. Para historias más largas, encadena clips con extensión o herramientas de edit, o córtalos en un NLE normal.

### ¿Seedance 2.0 es lo mismo que Seedance 2.5?

No. Seedance 2.5 es una superficie de producto / línea de modelo posterior en este sitio. Este artículo trata de la familia de modelos 2.0 lanzada por ByteDance Seed a principios de 2026.

### ¿Puedo usar parecidos reales de famosos como referencias?

Aplican las reglas del producto y la ley local. Las demos oficiales suelen usar sujetos licenciados o sintéticos. No asumas que capacidad técnica equivale a permiso.

## Conclusión

Seedance 2.0 se entiende mejor como un director short-form multimodal: varios tipos de media de entrada, imagen y sonido sincronizados de salida, con mejor movimiento y control que la generación 1.5. Si tu trabajo vive en beats de 5-15 segundos con necesidades reales de audio, merece estar en tu shortlist. Si solo necesitas loops silenciosos, un modelo más ligero o barato puede bastar."""

features_it = r"""Il team Seed di ByteDance ha rilasciato Seedance 2.0 a febbraio 2026. Se leggi solo i titoli di lancio, sembra un altro «modello video di nuova generazione». La domanda utile è più semplice: cosa puoi dargli in input, cosa esce e quando conviene usarlo al posto di un modello più vecchio?

Questa guida copre le capacità pubbliche di Seedance 2.0, senza il linguaggio da comunicato stampa. Le specifiche variano leggermente per piattaforma (Jimeng, CapCut, BytePlus, API di terze parti), quindi tratta i numeri qui sotto come baseline comune dai materiali ufficiali, non come garanzia per ogni endpoint.

## Cos'è Seedance 2.0

Seedance 2.0 è un modello nativo di generazione multimodale audio-video. Testo, immagine, audio e video possono stare nella stessa richiesta. Il modello è stato costruito per generare immagine e suono insieme, non per attaccare l'audio dopo.

Rispetto a Seedance 1.5 Pro, la linea 2.0 spinge di più su:

- movimento che rispetta la fisica più spesso (soprattutto azione multi-persona)
- seguire istruzioni lunghe e dettagliate
- mantenere i soggetti coerenti quando passi media di riferimento
- audio stereo allineato agli eventi a schermo

Non è magia. Volti complessi, testo minuscolo a schermo e identità multi-soggetto falliscono ancora a volte. È però un passo chiaro avanti per clip multi-shot che richiedono sia immagine sia suono.

## Input che puoi combinare

La documentazione pubblica della piattaforma aperta descrive un budget di riferimento abbastanza ampio:

- fino a 9 immagini
- fino a 3 clip video
- fino a 3 clip audio
- più istruzioni in linguaggio naturale

I tetti esatti dipendono dalla superficie prodotto. L'idea è la stessa ovunque: puoi bloccare in una volta aspetto del personaggio, layout della scena, linguaggio di camera, ritmo del movimento e carattere sonoro.

Pattern tipici:

- **Solo testo:** storyboard, ads, explainer, short stilizzati
- **Image-to-video:** frame di partenza (a volte di fine) con note di motion
- **Riferimenti ricchi:** storyboard + still di personaggio + location + voce o musica
- **Extend / edit:** continuare una clip o cambiare un beat senza rigenerare tutto da zero

## Durata di output, risoluzione e audio

Inviluppo pubblico comune:

| Spec | Intervallo tipico |
| --- | --- |
| Durata | circa 4-15 secondi |
| Risoluzione | 480p / 720p nativi; molti host offrono anche fino a 1080p |
| Audio | dual-channel, generato con il video |
| Shot | sequenze multi-shot dentro una sola clip |

L'audio è un differenziatore reale. Seedance 2.0 può posare performance quasi dialogiche, foley, ambience e cue musicali che atterrano sui beat di movimento. Conta di più per ads e short drama che per B-roll muto.

Frame rate e aspect ratio dipendono dall'app host. Aspettati i ratio social comuni (16:9, 9:16, 1:1) sulla maggior parte delle superfici.

## Tratti di qualità che emergono in pratica

### Movimento complesso e interazione

Le demo ufficiali insistono su sport multi-persona e lavoro di coppia (il pattinaggio artistico è l'esempio famoso). Nel quotidiano significa meno arti «fusi» e migliore trasferimento di peso quando due personaggi interagiscono. Per i volti servono ancora prompt puliti e buoni riferimenti.

### Instruction following

Script lunghi con note di camera («low angle sulle lame, poi un push-in per il sollevamento») funzionano meglio di una sola frase di mood vaga. Tratta il prompt come una shot list, non come una poesia.

### Controllabilità ed extension

Seedance 2.0 è posizionato per continuazione e edit mirati: proseguire dall'ultimo frame, scambiare un'azione, riscrivere un beat. Utile quando ti piace già l'80 % di una take.

### Profondità di riferimento multimodale

Composizione, movimenti di camera, stile e carattere audio possono tutti essere «citati» dai riferimenti. Uno storyboard still più una foto del personaggio è spesso più forte di un prompt di 200 parole da solo.

## Dove si colloca Seedance 2.0 in uno stack

Usa il tier standard Seedance 2.0 quando:

- la clip è un hero shot o un final client-facing
- ti serve maggiore fedeltà e dettaglio
- i riferimenti multimodali sono centrali nel brief
- l'audio nativo deve sembrare intenzionale, non opzionale

Passa ai membri più leggeri della famiglia (Fast / Mini) quando iteri prompt, testi il timing o produci ad alto volume a costo inferiore. Queste varianti condividono l'idea multimodale ma scambiano polish o risoluzione per velocità e prezzo. Vedi la guida Fast vs Mini per la tabella decisionale.

## Limiti onesti

Anche con buoni score interni, Seedance 2.0 fatica ancora con:

- testo e loghi minuscoli a schermo che devono restare leggibili
- coerenza multi-identità perfetta su molti personaggi
- artefatti audio occasionali su musica dura o dialetti
- struttura narrativa ultra-lunga (lavori ancora in clip corte)

Pianifica gli edit. Genera più take di quante ne pubblichi. Tieni a mente i diritti se carichi volti reali o musica protetta come riferimenti.

## FAQ

### Seedance 2.0 è solo text-to-video?

No. Text-to-video è una modalità. Image-to-video, reference-to-video, generazione audio-aware, extension e workflow di tipo edit fanno parte della storia di prodotto.

### Genera l'audio automaticamente?

Sì sulla linea standard 2.0: audio e video sono generati insieme, inclusa l'uscita dual-channel nei materiali ufficiali. Alcuni host consentono ancora di disattivare o sostituire l'audio.

### Quanto può durare una singola generazione?

La maggior parte delle descrizioni pubbliche cade nella finestra 4-15 secondi. Per storie più lunghe, concatena clip con extension o strumenti di edit, oppure montale in un NLE normale.

### Seedance 2.0 è uguale a Seedance 2.5?

No. Seedance 2.5 è una superficie prodotto / linea modello successiva su questo sito. Questo articolo riguarda la famiglia di modelli 2.0 rilasciata da ByteDance Seed all'inizio del 2026.

### Posso usare somiglianze reali di celebrità come riferimenti?

Valgono le regole di prodotto e la legge locale. Le demo ufficiali usano spesso soggetti licenziati o sintetici. Non confondere capacità tecnica e permesso.

## In sintesi

Seedance 2.0 si capisce meglio come un regista short-form multimodale: più tipi di media in ingresso, immagine e suono sincronizzati in uscita, con movimento e controllo migliori della generazione 1.5. Se il tuo lavoro vive in beat da 5-15 secondi con veri bisogni audio, merita la shortlist. Se ti servono solo loop silenziosi, un modello più leggero o economico può bastare."""

features_pl = r"""Zespół Seed w ByteDance wypuścił Seedance 2.0 w lutym 2026. Jeśli czytasz tylko nagłówki premierowe, brzmi to jak kolejny „model wideo nowej generacji”. Przydatne pytanie jest prostsze: co można podać na wejściu, co wychodzi i kiedy warto go użyć zamiast starszego modelu?

Ten przewodnik obejmuje publiczne możliwości Seedance 2.0 — bez PR-owego nadmiaru. Specyfikacje nieco różnią się w zależności od platformy (Jimeng, CapCut, BytePlus, API firm trzecich), więc traktuj poniższe liczby jako wspólną bazę z oficjalnych materiałów, a nie gwarancję dla każdego endpointu.

## Czym jest Seedance 2.0

Seedance 2.0 to natywny multimodalny model generacji audio-wideo. Tekst, obraz, audio i wideo mogą znaleźć się w tym samym żądaniu. Model powstał, by generować obraz i dźwięk razem, a nie doklejać audio po fakcie.

Względem Seedance 1.5 Pro linia 2.0 mocniej naciska na:

- ruch częściej zgodny z fizyką (zwłaszcza akcja wielu osób)
- podążanie za długimi, szczegółowymi instrukcjami
- spójność postaci przy mediach referencyjnych
- stereo audio zsynchronizowane ze zdarzeniami na ekranie

To nie magia. Złożone twarze, drobny tekst na ekranie i tożsamość wielu podmiotów czasem wciąż zawodzą. Jest to jednak wyraźny skok dla klipów multi-shot, które potrzebują zarówno obrazu, jak i dźwięku.

## Wejścia, które możesz łączyć

Publiczna dokumentacja otwartej platformy opisuje dość szeroki budżet referencji:

- do 9 obrazów
- do 3 klipów wideo
- do 3 klipów audio
- plus instrukcje w języku naturalnym

Dokładne limity zależą od powierzchni produktu. Idea jest wszędzie ta sama: możesz jednocześnie zablokować wygląd postaci, układ sceny, język kamery, rytm ruchu i charakter dźwięku.

Typowe wzorce:

- **Tylko tekst:** storyboardy, reklamy, explainery, stylizowane shorty
- **Image-to-video:** klatka startowa (czasem końcowa) z notatkami o ruchu
- **Dużo referencji:** storyboard + still postaci + lokalizacje + głos lub muzyka
- **Extend / edit:** kontynuacja klipu lub zmiana beatu bez regeneracji od zera

## Długość wyjścia, rozdzielczość i audio

Typowa publiczna obwiednia:

| Spec | Typowy zakres |
| --- | --- |
| Czas trwania | ok. 4-15 sekund |
| Rozdzielczość | natywnie 480p / 720p; wiele hostów oferuje też do 1080p |
| Audio | dwukanałowe, generowane razem z wideo |
| Ujęcia | sekwencje multi-shot w jednym klipie |

Audio to realny wyróżnik. Seedance 2.0 potrafi ułożyć performance zbliżoną do dialogu, foley, ambient i cue muzyczne, które lądują na beaty ruchu. To ma znaczenie bardziej dla reklam i short drama niż dla cichego B-rollu.

Klatkaż i proporcje zależą od aplikacji hosta. Spodziewaj się popularnych ratio social (16:9, 9:16, 1:1) na większości powierzchni.

## Cechy jakości, które widać w praktyce

### Złożony ruch i interakcja

Oficjalne dema podkreślają sport wieloosobowy i pracę w parach (łyżwiarstwo figurowe to słynny przykład). Na co dzień oznacza to mniej „stopionych” kończyn i lepsze przenoszenie ciężaru, gdy dwie postacie wchodzą w interakcję. Do twarzy wciąż potrzebujesz czystych promptów i dobrych referencji.

### Podążanie za instrukcjami

Długie skrypty z notatkami kamerowymi („niski kąt na łyżwy, potem push-in przy podnoszeniu”) działają lepiej niż jedno mgliste zdanie o nastroju. Traktuj prompt jak listę ujęć, nie jak wiersz.

### Sterowalność i extension

Seedance 2.0 jest pozycjonowany pod kontynuację i celowane edycje: idź dalej od ostatniej klatki, zamień akcję, przepisz beat. Przydatne, gdy 80 % ujęcia już Ci się podoba.

### Głębia referencji multimodalnych

Kompozycję, ruchy kamery, styl i charakter audio można „cytować” z referencji. Statyczny storyboard plus zdjęcie postaci często bije sam prompt na 200 słów.

## Gdzie Seedance 2.0 pasuje w stacku

Użyj standardowego tieru Seedance 2.0, gdy:

- klip to hero shot lub final pod klienta
- potrzebujesz silniejszej wierności i detalu
- referencje multimodalne są centralne dla briefu
- natywne audio ma brzmieć świadomie, nie opcjonalnie

Sięgaj po lżejszych członków rodziny (Fast / Mini), gdy iterujesz prompty, testujesz timing lub produkujesz duży wolumen taniej. Te warianty dzielą ideę multimodalną, ale wymieniają polish lub rozdzielczość na szybkość i cenę. Zobacz osobny przewodnik Fast vs Mini z tabelą decyzyjną.

## Uczciwe limity

Nawet przy dobrych wynikach wewnętrznych Seedance 2.0 wciąż ma problemy z:

- drobnym tekstem i logo na ekranie, które muszą zostać czytelne
- idealną spójnością multi-identity przy wielu postaciach
- okazjonalnymi artefaktami audio przy twardej muzyce lub dialektach
- ultra-długą strukturą narracyjną (wciąż pracujesz na krótkich klipach)

Planuj edycje. Generuj więcej ujęć, niż publikujesz. Pamiętaj o prawach, jeśli wgrywasz prawdziwe twarze lub chronioną muzykę jako referencje.

## FAQ

### Czy Seedance 2.0 to tylko text-to-video?

Nie. Text-to-video to jeden tryb. Image-to-video, reference-to-video, generacja z audio, extension i workflowy typu edit są częścią historii produktu.

### Czy generuje audio automatycznie?

Tak na standardowej linii 2.0: audio i wideo powstają razem, w tym wyjście dual-channel w oficjalnych materiałach. Niektóre hosty nadal pozwalają wyłączyć lub podmienić audio.

### Jak długa może być pojedyncza generacja?

Większość publicznych opisów mieści się w oknie 4-15 sekund. Dla dłuższych historii łącz klipy przez extension lub narzędzia edit albo tnij je w zwykłym NLE.

### Czy Seedance 2.0 to to samo co Seedance 2.5?

Nie. Seedance 2.5 to późniejsza powierzchnia produktu / linia modeli na tej stronie. Ten artykuł dotyczy rodziny modeli 2.0 wydanej przez ByteDance Seed na początku 2026.

### Czy mogę używać prawdziwych wizerunków celebrytów jako referencji?

Obowiązują reguły produktu i prawo lokalne. Oficjalne dema często używają licencjonowanych lub syntetycznych podmiotów. Nie zakładaj, że zdolność techniczna równa się zgodzie.

## Podsumowanie

Seedance 2.0 najlepiej rozumieć jako short-form, multimodalnego reżysera: wiele typów mediów na wejściu, zsynchronizowany obraz i dźwięk na wyjściu, z lepszym ruchem i kontrolą niż generacja 1.5. Jeśli Twoja praca żyje w beatach 5-15 sekund z realnymi potrzebami audio, zasługuje na shortlistę. Jeśli potrzebujesz tylko cichych pętli, lżejszy lub tańszy model może wystarczyć."""

features_ja = r"""ByteDanceのSeedチームは2026年2月にSeedance 2.0を公開しました。ローンチの見出しだけを読むと「次世代ビデオモデル」のひとつに見えます。実務で効く問いはもっと単純です。何を入れられるか、何が出るか、いつ古いモデルの代わりに使うべきか。

本ガイドはSeedance 2.0の公開能力を、プレスリリース調の言い回し抜きで整理します。仕様はプラットフォーム（即夢 Jimeng、CapCut、BytePlus、第三者API）ごとに少し異なります。以下の数値は公式資料に基づく共通ベースラインであり、すべてのエンドポイントの保証ではありません。

## Seedance 2.0とは何か

Seedance 2.0はネイティブなマルチモーダル音声・映像生成モデルです。テキスト、画像、音声、動画を同一リクエストに載せられます。映像のあとに音声を後付けするのではなく、絵と音をまとめて生成する設計です。

Seedance 1.5 Proと比べ、2.0系がより強く押し出す点は次のとおりです。

- 物理に沿った動き（特に複数人のアクション）
- 長く詳細な指示の追従
- 参照メディアを渡したときの被写体の一貫性
- 画面上の出来事に追従するステレオ音声

魔法ではありません。複雑な顔、画面内の極小テキスト、複数主体の同一性は今でも失敗することがあります。一方で、絵と音の両方が必要なマルチショットクリップでは明確な一段上の品質です。

## 組み合わせられる入力

オープンプラットフォーム向けの公開ドキュメントでは、かなり広い参照枠が示されています。

- 画像最大9枚
- 動画クリップ最大3本
- 音声クリップ最大3本
- 加えて自然言語の指示

正確な上限は製品面ごとに異なります。考え方はどこでも同じで、キャラの見た目、場面のレイアウト、カメラ言語、動きのリズム、音のキャラクターを一度に固定できます。

典型パターン：

- **テキストのみ:** ストーリーボード、広告、解説、スタイル付きショート
- **Image-to-video:** 開始フレーム（場合により終了フレーム）と動きのメモ
- **参照重視:** ストーリーボード＋キャラ静止画＋ロケーション＋声や音楽
- **Extend / Edit:** ゼロからやり直さず、続きを伸ばす／特定のビートだけ変える

## 出力の長さ・解像度・音声

一般的な公開スペックの範囲：

| 項目 | 典型的な範囲 |
| --- | --- |
| 尺 | おおよそ4〜15秒 |
| 解像度 | ネイティブ480p/720p。多くのホストは1080pまでも提供 |
| 音声 | デュアルチャンネル。映像と同時生成 |
| ショット | 1クリップ内のマルチショット |

音声は本当の差別化要因です。対話に近い演技、フォーリー、アンビエンス、動きのビートに乗る音楽キューを置けます。サイレントのBロールより、広告やショートドラマで効きます。

フレームレートとアスペクト比はホストアプリ次第です。多くの製品面では一般的なSNS比率（16:9、9:16、1:1）が期待できます。

## 実務で見える品質特性

### 複雑な動きと相互作用

公式デモは複数人スポーツやペアワーク（有名なのはフィギュアスケート）を強調します。日常では、二人のキャラが触れ合うときの「溶けた四肢」が減り、体重移動が良くなる、という意味です。顔には依然として明確なプロンプトと良い参照が必要です。

### 指示追従

カメラメモ付きの長いスクリプト（「ブレードのローアングル、リフトでプッシュイン」）は、曖昧なムード一文より効きます。プロンプトは詩ではなくショットリストとして書いてください。

### 制御性とエクステンション

Seedance 2.0は続き生成と狙った編集向けに位置づけられます。最終フレームから伸ばす、アクションを入れ替える、ビートを書き換える。テイクの80%が気に入っているときに有用です。

### マルチモーダル参照の深さ

構図、カメラワーク、スタイル、音の性格を参照から「引用」できます。静止ストーリーボード＋キャラ写真の組み合わせは、200語のプロンプト単体より強いことが多いです。

## スタックのどこに置くか

標準のSeedance 2.0を使う場面：

- ヒーローショットやクライアント向け最終稿
- より高い忠実度とディテールが必要
- マルチモーダル参照がブリーフの中心
- ネイティブ音声を意図的に聞かせたい（オプションではない）

プロンプトの反復、タイミング検証、低コストの大量生成なら、軽い系（Fast / Mini）へ。これらはマルチモーダルの考え方を共有しつつ、仕上がりや解像度を速度と価格と交換します。判断表はFast vs Miniガイドを参照してください。

## 正直な限界

内部ベンチが強くても、Seedance 2.0は次にまだ苦労します。

- 読める必要がある画面内の極小テキストとロゴ
- 多数キャラにまたがる完璧なマルチ同一性
- 激しい音楽や方言でのときどきの音声アーティファクト
- 超長尺の物語構造（作業単位は依然ショートクリップ）

編集を前提にしてください。公開するより多くのテイクを生成し、実在の顔や著作権付き音楽を参照として上げる場合は権利クリアを忘れないでください。

## FAQ

### Seedance 2.0はテキストから動画だけですか？

いいえ。テキストtoビデオはモードのひとつです。Image-to-video、reference-to-video、音声を意識した生成、エクステンション、編集型ワークフローも製品ストーリーの一部です。

### 音声は自動で生成されますか？

標準2.0ラインでははい。映像と音声は同時生成され、公式資料ではデュアルチャンネル出力も示されます。ホストによってはミュートや差し替えも可能です。

### 1回の生成はどれくらいの長さですか？

公開記述の多くは4〜15秒の窓に収まります。より長い話はエクステンションや編集ツールで連結するか、通常のNLEで切ってください。

### Seedance 2.0はSeedance 2.5と同じですか？

いいえ。Seedance 2.5はこのサイト上の後続の製品面／モデルラインです。本稿は2026年初頭にByteDance Seedが公開した2.0モデルファミリーについてです。

### 実在の有名人の似姿を参照に使えますか？

製品ルールと現地法が適用されます。公式デモはライセンス済みや合成主体を使うことが多いです。技術的にできることと許可は別物です。

## まとめ

Seedance 2.0は、短尺のマルチモーダル・ディレクターとして理解するのが最も近いです。複数メディアを入れ、同期した絵と音を出し、1.5世代より良い動きと制御を備えます。5〜15秒のビートと本物の音声ニーズで仕事するならショートリストに入れる価値があります。サイレントループだけなら、より軽い／安いモデルで足りることもあります。"""

features_ko = r"""ByteDance의 Seed 팀은 2026년 2월 Seedance 2.0을 공개했습니다. 출시 헤드라인만 보면 또 하나의 "차세대 비디오 모델"처럼 들립니다. 실무에 필요한 질문은 더 단순합니다. 무엇을 넣을 수 있는지, 무엇이 나오는지, 언제 구형 모델 대신 써야 하는지.

이 가이드는 Seedance 2.0의 공개 역량을 보도자료 문장 없이 정리합니다. 사양은 플랫폼(Jimeng, CapCut, BytePlus, 서드파티 API)마다 조금 다릅니다. 아래 수치는 공식 자료 기준의 공통 베이스라인이며, 모든 엔드포인트에 대한 보장이 아닙니다.

## Seedance 2.0이란

Seedance 2.0은 네이티브 멀티모달 오디오·비디오 생성 모델입니다. 텍스트, 이미지, 오디오, 비디오를 같은 요청에 넣을 수 있습니다. 영상 뒤에 오디오를 붙이는 방식이 아니라, 그림과 소리를 함께 생성하도록 설계되었습니다.

Seedance 1.5 Pro 대비 2.0 계열이 더 강하게 밀어붙이는 지점:

- 물리 법칙에 더 자주 맞는 모션(특히 다인 액션)
- 길고 상세한 지시 따르기
- 참조 미디어를 넣을 때 피사체 일관성
- 화면 이벤트에 맞추는 스테레오 오디오

마법은 아닙니다. 복잡한 얼굴, 화면 속 아주 작은 텍스트, 다중 주체 정체성은 여전히 실패할 수 있습니다. 다만 그림과 소리가 모두 필요한 멀티샷 클립에서는 확실한 한 단계 위입니다.

## 결합할 수 있는 입력

오픈 플랫폼 공개 문서는 비교적 넓은 참조 예산을 설명합니다.

- 이미지 최대 9장
- 비디오 클립 최대 3개
- 오디오 클립 최대 3개
- 자연어 지시 추가

정확한 상한은 제품 표면마다 다릅니다. 아이디어는 어디서나 같습니다. 캐릭터 룩, 장면 레이아웃, 카메라 언어, 모션 리듬, 사운드 캐릭터를 한 번에 고정할 수 있습니다.

전형적인 패턴:

- **텍스트만:** 스토리보드, 광고, 설명형, 스타일 쇼츠
- **Image-to-video:** 시작 프레임(때로는 끝 프레임) + 모션 노트
- **참조 중심:** 스토리보드 + 캐릭터 스틸 + 로케이션 + 보이스/음악
- **Extend / Edit:** 전부 처음부터 다시 만들지 않고 클립을 이어가거나 비트만 변경

## 출력 길이, 해상도, 오디오

일반적인 공개 범위:

| 항목 | 전형적 범위 |
| --- | --- |
| 길이 | 약 4–15초 |
| 해상도 | 네이티브 480p/720p, 많은 호스트는 1080p까지 제공 |
| 오디오 | 듀얼 채널, 비디오와 함께 생성 |
| 샷 | 한 클립 안의 멀티샷 시퀀스 |

오디오는 진짜 차별점입니다. 대화형 퍼포먼스, 폴리, 앰비언스, 모션 비트에 떨어지는 음악 큐를 깔 수 있습니다. 무음 B-roll보다 광고와 숏 드라마에서 더 중요합니다.

프레임레이트와 화면비는 호스트 앱에 달립니다. 대부분의 제품 표면에서는 흔한 SNS 비율(16:9, 9:16, 1:1)을 기대하세요.

## 실무에서 드러나는 품질 특성

### 복잡한 모션과 상호작용

공식 데모는 다인 스포츠와 페어 워크(유명 예시는 피겨스케이팅)를 강조합니다. 일상에서는 두 캐릭터가 상호작용할 때 "녹은 사지"가 줄고 무게 이동이 나아진다는 뜻입니다. 얼굴에는 여전히 깔끔한 프롬프트와 좋은 참조가 필요합니다.

### 지시 따르기

카메라 노트가 있는 긴 스크립트("블레이드 로우앵글, 리프트에서 푸시인")가 애매한 무드 한 문장보다 잘 됩니다. 프롬프트를 시가 아니라 샷 리스트처럼 다루세요.

### 제어성과 익스텐션

Seedance 2.0은 이어가기와 타깃 편집에 맞춰 포지셔닝됩니다. 마지막 프레임에서 계속, 액션 교체, 비트 재작성. 테이크의 80%가 이미 마음에 들 때 유용합니다.

### 멀티모달 참조 깊이

구도, 카메라 무브, 스타일, 오디오 캐릭터를 참조에서 "인용"할 수 있습니다. 스틸 스토리보드 + 캐릭터 사진 조합이 200단어 프롬프트 단독보다 강한 경우가 많습니다.

## 스택에서 Seedance 2.0의 위치

표준 Seedance 2.0을 쓸 때:

- 히어로 샷이거나 클라이언트용 최종본
- 더 높은 충실도와 디테일이 필요
- 멀티모달 참조가 브리프의 중심
- 네이티브 오디오가 의도적으로 들려야 함(옵션이 아님)

프롬프트 반복, 타이밍 테스트, 저비용 대량 제작에는 가벼운 패밀리 멤버(Fast / Mini)를 쓰세요. 멀티모달 아이디어는 공유하되 완성도나 해상도를 속도와 가격과 맞바꿉니다. 결정 표는 Fast vs Mini 가이드를 보세요.

## 정직한 한계

내부 벤치 점수가 좋아도 Seedance 2.0은 여전히 다음에서 힘겨워합니다.

- 읽혀야 하는 화면 속 아주 작은 텍스트와 로고
- 여러 캐릭터에 걸친 완벽한 다중 정체성 일관성
- 강한 음악이나 방언에서 가끔 나오는 오디오 아티팩트
- 초장편 서사 구조(여전히 숏 클립 단위로 작업)

편집을 계획하세요. 게시하는 것보다 많은 테이크를 만들고, 실제 얼굴이나 저작권 음악을 참조로 올릴 때는 권리 클리어를 염두에 두세요.

## FAQ

### Seedance 2.0은 텍스트 투 비디오만인가요?

아니요. 텍스트 투 비디오는 한 모드입니다. Image-to-video, reference-to-video, 오디오 인식 생성, 익스텐션, 편집형 워크플로가 제품 스토리의 일부입니다.

### 오디오를 자동으로 생성하나요?

표준 2.0 라인에서는 예입니다. 오디오와 비디오가 함께 생성되며 공식 자료에는 듀얼 채널 출력도 포함됩니다. 일부 호스트는 음소거나 교체를 허용합니다.

### 한 번 생성은 얼마나 길 수 있나요?

공개 설명 대부분은 4–15초 구간에 들어갑니다. 더 긴 이야기는 익스텐션·편집 도구로 이어 붙이거나 일반 NLE에서 자르세요.

### Seedance 2.0은 Seedance 2.5와 같은가요?

아니요. Seedance 2.5는 이 사이트의 이후 제품 표면/모델 라인입니다. 이 글은 2026년 초 ByteDance Seed가 공개한 2.0 모델 패밀리를 다룹니다.

### 실존 유명인 닮은 모습을 참조로 써도 되나요?

제품 규칙과 현지 법이 적용됩니다. 공식 데모는 라이선스 또는 합성 주체를 자주 씁니다. 기술 가능성과 허가를 동일시하지 마세요.

## 한 줄 정리

Seedance 2.0은 숏폼 멀티모달 디렉터로 이해하는 것이 가장 가깝습니다. 여러 미디어 타입 입력, 동기화된 그림과 소리 출력, 1.5 세대보다 나은 모션과 제어. 5–15초 비트와 실제 오디오 니즈로 일한다면 숏리스트에 넣을 만합니다. 무음 루프만 필요하면 더 가볍거나 저렴한 모델로도 충분할 수 있습니다."""

# ---------------------------------------------------------------------------
# seedance-2-0-creative-workflows
# ---------------------------------------------------------------------------

workflows_de = r"""Spezifikationen allein bringen Sie nur so weit. Die meisten gescheiterten Seedance-2.0-Takes kommen von schwachen Briefs, nicht davon, dass „das Modell kaputt“ ist. Dieser Artikel ist ein Arbeits-Playbook für Text-, Bild-, Audio- und Video-Inputs — mit einer Iterationsschleife, die Sie auf jedem Host wiederholen können, der die 2.0-Familie anbietet.

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

Behandeln Sie Seedance 2.0 wie einen Junior-Director mit perfekter Ausdauer und unvollkommenem Geschmack. Geordnete Shots, saubere Referenzen und wenige harte Constraints geben. Hero-Fidelity für den Final-Pass sparen. Der Workflow — nicht der Slogan — lässt das Modell auf einer echten Timeline teuer aussehen."""

workflows_fr = r"""Les specs seules ne suffisent pas. La plupart des prises Seedance 2.0 ratées viennent de briefs faibles, pas d'un « modèle cassé ». Cet article est un playbook de production pour les entrées texte, image, audio et vidéo, avec une boucle d'itération reproductible sur tout hôte qui expose la famille 2.0.

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

Traitez Seedance 2.0 comme un junior director à l'endurance parfaite et au goût imparfait. Donnez-lui des plans ordonnés, des références propres et peu de contraintes dures. Gardez la fidélité hero pour le pass final. C'est le workflow, pas le slogan, qui fait paraître le modèle cher sur une vraie timeline."""

workflows_es = r"""Las specs solas solo te llevan hasta cierto punto. La mayoría de tomas fallidas de Seedance 2.0 vienen de briefs débiles, no de que «el modelo esté roto». Este artículo es un playbook de trabajo para entradas de texto, imagen, audio y vídeo, con un bucle de iteración que puedes repetir en cualquier host que exponga la familia 2.0.

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

Trata Seedance 2.0 como un junior director con stamina perfecta y gusto imperfecto. Dale planos ordenados, referencias limpias y pocas restricciones duras. Guarda la fidelidad hero para el pase final. El workflow, no el eslogan, es lo que hace que el modelo se vea caro en una timeline real."""

workflows_it = r"""Le sole specifiche non bastano. La maggior parte delle take Seedance 2.0 fallite nasce da brief deboli, non da un «modello rotto». Questo articolo è un playbook operativo per input di testo, immagine, audio e video, con un loop di iterazione ripetibile su qualsiasi host che esponga la famiglia 2.0.

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

Tratta Seedance 2.0 come un junior director con stamina perfetta e gusto imperfetto. Daglie shot ordinati, riferimenti puliti e poche hard constraint. Risparmia la fedeltà hero per il pass finale. Il workflow, non lo slogan, è ciò che fa sembrare il modello costoso su una timeline reale."""

workflows_pl = r"""Same specyfikacje zaprowadzą Cię tylko tak daleko. Większość nieudanych ujęć Seedance 2.0 wynika ze słabych briefów, a nie z tego, że „model jest zepsuty”. Ten artykuł to roboczy playbook dla wejść tekstu, obrazu, audio i wideo — z pętlą iteracji, którą powtórzysz na każdym hoście udostępniającym rodzinę 2.0.

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

Traktuj Seedance 2.0 jak junior directora z idealną wytrzymałością i niedoskonałym gustem. Daj mu uporządkowane ujęcia, czyste referencje i małą liczbę twardych ograniczeń. Hero fidelity zostaw na final pass. Workflow, nie slogan, sprawia, że model wygląda drogo na prawdziwej timeline."""

workflows_ja = r"""スペックだけでは足りません。Seedance 2.0の失敗テイクの多くは「モデルが壊れている」からではなく、弱いブリーフから来ます。本稿はテキスト・画像・音声・動画入力の実務プレイブックで、2.0ファミリーを公開しているホストならどこでも繰り返せる反復ループ付きです。

## 雰囲気の一文ではなくショットリストから始める

一行のムードプロンプト（「cinematic rainy street, emotional」）は、モデルに構造を発明させます。より良いやり方は、クリップを3〜6ビートで書くことです。

例の骨格：

1. オープニング・インサート（物や環境、1〜2秒）
2. 明確なアクションでのキャラ入場
3. 相互作用またはプロダクトの瞬間
4. リアクション／ペイオフ
5. 任意のブランド／テキスト安全なエンドフレーム

Seedance 2.0は、プロンプトがカメラワークとタイミングを名指しするとき、マルチショットをよりきれいに扱います。映画言語を借りてください：low angle、push-in、whip pan、insert、two-shot。完璧な専門用語は不要で、順序立った出来事が必要です。

## 本当に効くマルチモーダル・スタック

### 画像

同一性やレイアウトを安定させたいときに画像を使います。

- キャラクターシートまたはきれいなポートレート
- ロケーションプレート
- ストーリーボードのフレーム
- シルエットが読める製品パックショット

ごちゃついたコラージュは避ける。1画像1仕事。ホストがラベル付き参照（@Image 1）をサポートするなら、プロンプトでラベルを使う。

### 動画参照

短いモーション参照が長いものに勝ります。次が必要なときにクリップを渡します。

- カメラパス
- 身体のリズム（ダンス、スポーツ）
- 編集のペース

動画参照の合計尺はホスト上限内に（多くの場合クリップ合計でおおよそ15秒前後）。

### 音声参照

音声は軽視されがちです。3〜8秒のサンプルで次を固定できます。

- 声の音色
- 音楽ジャンルとテンポ
- フォーリーの質感（雨、群衆、機械）

何を保ち何を無視するかを言う（「パーカッションのテンポに合わせ、メロディは新規で」）。

## 3つの制作レシピ

### 1) プロダクト広告（I2V + テキスト）

入力：ヒーロー製品スチール、任意のライフスタイルプレート、カメラメモ付き40〜80語のスクリプト。
目標：読める製品、明確な1アクション、瞬間を売る音声。
ヒント：フレーミングのドリフトを防ぐため、ブリーフの最初と最後の1秒に製品を置く。

### 2) キャラクター・ショート（複数画像 + テキスト）

入力：一貫したキャラ静止画2〜3枚、衣装メモ、ロケーション画像。
目標：ショット間で同じ顔と衣装。
ヒント：同一性がドリフトしたら、プロンプトを長くする前に同時キャラ数を減らす。

### 3) 音楽主導のソーシャルカット（音声 + テキストまたはR2V）

入力：ミュージックベッドまたはSFXベッド、テキスト内のビートマーカー（「スピンでスネアにヒット」）。
目標：モーションのアクセントが音声のアクセントに着地する。
ヒント：2つの尺（例：5秒と10秒）を生成し、息のある方を選ぶ。

## 制御性：ゼロからやり直さずExtendとEdit

テイクの80%が機能しているなら、クレジットをゼロ再生成で燃やさない。続きはエクステンション、1ビートの変更は編集プロンプト（終わりのアクションを入れ替え、衣装は維持）。公式資料はこれらを2.0の中核的強みとして推しています。

安定ループ：

1. 構造はFastまたはMiniでドラフト
2. プロンプト＋参照をロック
3. 最終パスは標準Seedance 2.0
4. キーパーテイクだけを延長
5. テキスト・色・ラウドネスはNLEで仕上げ

## リトライを減らすプロンプト衛生

- 被写体は一度名付け、同じラベルを再利用（「オレンジの配達員」）
- 形容詞より具体的な動詞
- 同時カメラトリックの数に上限
- ASMRや対話のみのベッドが欲しいとき、何を無音にするか明記
- 画面内テキストは可能な限りモデル外で後から合成

## 権利とセーフティ

参照アップロードには顔、ロゴ、音楽が含まれ得ます。技術的成功は法的クリアランスではありません。ライセンス済みストック、合成キャラ、管理下のタレントを優先。ホストは実在人物の似姿に本人確認を求める場合があります。

## FAQ

### 参照はいくつから始める？

強い画像1枚かゼロから。失敗モード（顔ドリフト、場所違い、平板な音）が出たときだけ追加。入力が多いほど助けにも混乱にもなります。

### マルチショットがランダムに感じるのはなぜ？

多くはショット順の欠落です。ビートに番号を振る。「cut to」「camera holds」「match on action」などのトランジションを足す。

### すべての案件で音声生成を使うべき？

いいえ。サイレントループやテンプレBロールは無しの方が安いことがあります。リップのエネルギー、フォーリー、音楽タイミングが納品物の一部ならネイティブ音声を。

### Seedance 2.0は編集者を置き換えられる？

いいえ。空のタイムライン症候群を置き換えます。テイク選び、ペース修正、プラットフォーム安全な書き出しは依然として人が行います。

### モデルを学ぶ最速の方法は？

レシピを1つ選ぶ（製品広告またはキャラショート）。同じ参照で10バリエーションを生成し、一度にプロンプト変数を1つだけ変える。

## 結び

Seedance 2.0を、スタミナ完璧・センス不完全なジュニア・ディレクターとして扱ってください。順序立ったショット、きれいな参照、少数の硬い制約を与え、ヒーロー忠実度は最終パスに温存する。スローガンではなくワークフローが、本物のタイムライン上でモデルを「高く見える」ものにします。"""

workflows_ko = r"""스펙만으로는 한계가 있습니다. 실패한 Seedance 2.0 테이크의 대부분은 "모델이 고장"이 아니라 약한 브리프에서 옵니다. 이 글은 텍스트·이미지·오디오·비디오 입력을 위한 실무 플레이북이며, 2.0 패밀리를 노출하는 어떤 호스트에서도 반복할 수 있는 반복 루프를 포함합니다.

## 분위기 한 문장이 아니라 샷 리스트로 시작

한 줄 무드 프롬프트("cinematic rainy street, emotional")는 모델에게 구조를 발명하도록 강요합니다. 더 나은 방법: 클립을 3–6개 비트로 씁니다.

예시 골격:

1. 오프닝 인서트(물체 또는 환경, 1–2초)
2. 명확한 액션이 있는 캐릭터 등장
3. 상호작용 또는 제품 순간
4. 반응 / 페이오프
5. 선택적 브랜드 또는 텍스트 세이프 엔드 프레임

Seedance 2.0은 프롬프트가 카메라 무브와 타이밍을 이름 지을 때 멀티샷을 더 깔끔하게 다룹니다. 영화 언어를 빌려 쓰세요: low angle, push-in, whip pan, insert, two-shot. 완벽한 전문 용어는 필요 없고, 순서 있는 사건이 필요합니다.

## 실제로 도움이 되는 멀티모달 스택

### 이미지

정체성이나 레이아웃이 안정적이어야 할 때 이미지를 씁니다.

- 캐릭터 시트 또는 깔끔한 초상
- 로케이션 플레이트
- 스토리보드 프레임
- 실루엣이 읽히는 제품 팩샷

복잡한 콜라주는 피하세요. 이미지당 일 하나. 호스트가 라벨 참조(@Image 1)를 지원하면 프롬프트에 라벨을 쓰세요.

### 비디오 참조

짧은 모션 참조가 긴 것보다 낫습니다. 다음이 필요할 때 클립을 넣습니다.

- 카메라 경로
- 몸 리듬(댄스, 스포츠)
- 편집 페이스

결합 비디오 참조 길이는 호스트 한도 안(보통 클립 합쳐 약 15초 근처).

### 오디오 참조

오디오는 쉽게 과소사용됩니다. 3–8초 샘플로 다음을 고정할 수 있습니다.

- 보이스 팀버
- 음악 장르와 템포
- 폴리 질감(비, 군중, 기계)

무엇을 유지하고 무시할지 말하세요("퍼커션 템포에 맞추고, 멜로디는 새로").

## 세 가지 제작 레시피

### 1) 제품 광고(I2V + 텍스트)

입력: 히어로 제품 스틸, 선택적 라이프스타일 플레이트, 카메라 노트 포함 40–80단어 스크립트.
목표: 읽히는 제품, 명확한 한 액션, 순간을 파는 오디오.
팁: 프레이밍 드리프트를 막으려면 브리프 첫 초와 마지막 초에 제품을 넣으세요.

### 2) 캐릭터 쇼트(다중 이미지 + 텍스트)

입력: 일관된 캐릭터 스틸 2–3장, 의상 노트, 로케이션 이미지.
목표: 샷 간 같은 얼굴과 의상.
팁: 정체성이 드리프트하면 프롬프트를 늘리기 전에 동시 캐릭터 수를 줄이세요.

### 3) 음악 주도 소셜 컷(오디오 + 텍스트 또는 R2V)

입력: 뮤직 베드 또는 SFX 베드, 텍스트 비트 마커("스핀에서 스네어에 히트").
목표: 모션 악센트가 오디오 악센트에 착지.
팁: 두 길이(예: 5초와 10초)를 생성하고 숨 쉬는 쪽을 고르세요.

## 제어성: 처음부터 다시 하지 말고 extend와 edit

테이크의 80%가 되면 크레딧을 제로 재생성으로 태우지 마세요. 이어가기는 익스텐션, 한 비트 변경은 편집 프롬프트(엔딩 액션 교체, 의상 유지). 공식 자료는 이를 2.0의 핵심 강점으로 밀고 있습니다.

안정 루프:

1. 구조는 Fast 또는 Mini로 드래프트
2. 프롬프트 + 참조 잠금
3. 최종 패스는 표준 Seedance 2.0
4. 키퍼 테이크만 연장
5. 텍스트·색·라우드니스는 NLE에서 마무리

## 재시도를 줄이는 프롬프트 위생

- 주체를 한 번 이름 짓고 같은 라벨 재사용("주황색 배달원")
- 형용사보다 구체적 동사
- 동시 카메라 트릭 수에 상한
- ASMR이나 대화 전용 베드면 무엇이 침묵해야 하는지 명시
- 화면 텍스트는 가능하면 모델 밖에서 나중에 합성

## 권리와 세이프티

참조 업로드에는 얼굴, 로고, 음악이 포함될 수 있습니다. 기술 성공은 법적 클리어런스가 아닙니다. 라이선스 스톡, 합성 캐릭터, 통제 가능한 탤런트를 선호하세요. 호스트는 실존 인물 닮은 모습에 신원 확인을 요구할 수 있습니다.

## FAQ

### 참조는 몇 개부터?

강한 이미지 한 장 또는 없음으로 시작. 실패 모드(얼굴 드리프트, 잘못된 장소, 납작한 오디오)가 나타날 때만 추가. 입력이 많을수록 도움이 될 수도, 혼란스러울 수도 있습니다.

### 멀티샷 클립이 무작위처럼 느껴지는 이유?

보통 샷 순서 부재입니다. 비트에 번호를 매기고, 전환을 추가하세요("cut to", "camera holds", "match on action").

### 모든 프로젝트에 오디오 생성을 써야 하나요?

아니요. 무음 루프와 템플릿 B-roll은 없이 더 쌀 수 있습니다. 립 에너지, 폴리, 음악 타이밍이 납품물의 일부일 때 네이티브 오디오를 쓰세요.

### Seedance 2.0이 에디터를 대체할 수 있나요?

아니요. 빈 타임라인 증후군을 대체합니다. 테이크 선택, 페이스 수정, 플랫폼 안전 내보내기는 여전히 사람이 합니다.

### 모델을 배우는 가장 빠른 방법은?

레시피 하나(제품 광고 또는 캐릭터 쇼트)를 고르세요. 같은 참조로 10변주를 만들고 한 번에 프롬프트 변수 하나만 바꾸세요.

## 마무리

Seedance 2.0을 스태미나는 완벽하고 취향은 불완전한 주니어 디렉터처럼 다루세요. 정렬된 샷, 깨끗한 참조, 소수의 강한 제약을 주고, 히어로 충실도는 최종 패스에 남겨 두세요. 슬로건이 아니라 워크플로가 진짜 타임라인에서 모델을 비싸 보이게 만듭니다."""

# ---------------------------------------------------------------------------
# seedance-2-0-fast-vs-mini
# ---------------------------------------------------------------------------

fastmini_de = r"""Die Seedance-2.0-Familie ist kein einzelnes Modell mit Marketing-Badge. Nach dem Launch von Standard Seedance 2.0 im Februar 2026 ergänzten ByteDance und Hosting-Plattformen leichtere Stufen für Speed und Kosten. Zwei Namen tauchen in Production-Chats ständig auf: **Seedance 2.0 Fast** und **Seedance 2.0 Mini**.

Sie lösen unterschiedliche Engpässe. Fast ist der beschleunigte Zwilling des Flagships. Mini, das etwa Mitte Juni 2026 breiter sichtbar wurde, ist die High-Throughput-, Low-Cost-Stufe. Dieser Guide vergleicht sie mit konservativen öffentlichen Claims und einer Workflow-Linse. Plattformpreise bewegen sich — prüfen Sie immer den Meter des Hosts, den Sie bezahlen.

## Schnelle Entscheidungstabelle

| Bedarf | Bevorzugen |
| --- | --- |
| Niedrigste Latenz für Prompt-Tests | Fast oder Mini (Mini gewinnt oft bei purem Speed/Cost) |
| Höchstes Volumen pro Dollar | Mini |
| Stärkere Draft-Qualität vor Flagship-Pass | Fast (manchmal Mini; an Ihrem Content urteilen) |
| 1080p / maximales Polish-Final | Standard Seedance 2.0, nicht Mini |
| Multimodale Referenzen bei knapperem Budget | Mini oder Fast, dann Keeper auf Standard promoten |

## Wofür Fast da ist

Seedance 2.0 Fast ist die Low-Latency-Variante der 2.0-Architektur. Hosts positionieren sie für:

- schnelle Prompt-Iteration
- leichte Drafts vor dem Final-Render
- Workflows, die Controls mit Standard 2.0 teilen, aber früher fertig sind

Öffentliche Beschreibungen behalten meist die multimodale Idee (Text / Bild / Video / Audio-Referenzen) und tauschen etwas Treue gegen Turnaround. Auflösungsangebote hängen vom Host ab; viele listen Fast bis 720p-Klasse, manchmal höher. Jede API-Karte als Source of Truth behandeln.

Fast nutzen, wenn der Engpass **Warten** ist, nicht **Stückkosten**. Beispiel: Art-Direction-Sessions mit 15 Strukturtests in einer Stunde.

## Wofür Mini da ist

Seedance 2.0 Mini ist die Economy-Stufe derselben Generation. Öffentliche Drittschreiber behaupten häufig:

- grob **2× schneller** als Fast in ihren Tests oder Vendor-Copy
- etwa **halbe Kosten** von Standard Seedance 2.0 auf manchen Metern
- Output-Deckel um **480p / 720p** (kein Cinema-Master-Tier)
- Cliplängen weiterhin im Short-Form-**4-15-Sekunden**-Umfeld
- multimodale Referenzen bleiben, oft mit reduziertem Referenzbudget

Das sind Richtwerte, keine Universalsätze. ByteDances eigene RMB-Preise, BytePlus-USD-Raten und Aggregator-APIs stimmen nicht immer überein. Ein wiederkehrender Fehler in englischen Medien: ¥ und $ vermischen — Währung vor dem Budget prüfen.

Mini nutzen, wenn der Engpass **Volumen × Preis** ist: E-Commerce-Batches, UGC-artige Varianten, Social-Cutdowns, First-Pass-Animatics.

## Fast vs Mini vs Standard 2.0

In drei Spuren denken:

1. **Standard Seedance 2.0** — Hero-Fidelity, reicheres Detail, am besten, wenn der Clip als Final (oder Near-Final) an Client oder Ads-Account geht.
2. **Fast** — dieselbe Familie, beschleunigt; stark für Struktur-Suchen, wenn Draft-Ästhetik noch solid sein soll.
3. **Mini** — günstigste/schnellste Spur für Menge; erwarten Sie niedrigere Auflösungsdecken und mehr „Draft-DNA“.

Praktische Leiter, die viele Teams übernehmen:

1. Beats auf Mini explorieren
2. Kamera und Performance auf Fast locken (optional, wenn Mini schon stimmt)
3. Keeper auf Standard 2.0 rendern
4. Nur den Gewinner extenden oder graden

Die Leiter für interne Drafts zu skippen ist ok. Für bezahlte Finals zu skippen ist, wie weiche Hände und matschige Produktlabels in Ads rutschen.

## Qualitätserwartungen (ehrliche Version)

Vendor-Charts behaupten manchmal, Mini schlage Fast bei Motion-Stabilität. Unabhängige Reviews sind gemischt. Ihr Content-Typ entscheidet mehr als das Badge:

- Gesichter und Wardrobe-Kontinuität: beide mit denselben Referenzen testen
- Produkt-Packshots: Edge-Shimmer und Logo-Mush bei 720p beobachten
- Tanz / Sport: Fast hält auf manchen Hosts die Form besser; Mini kann für Thumbnails „gut genug“ sein
- Audio: alle 2.0-Hosts mit nativem Audio brauchen einen Listen-Pass; günstigere Stufen klingen dünner

Machen Sie ein A/B mit drei festen Prompts, bevor Sie Pipeline-Docs umschreiben.

## Kostenplanung ohne Fantasy-Zahlen

Statt viraler Per-Second-Preise, die veralten:

1. Host-Einheit notieren (pro Sekunde, pro Clip, pro Credit)
2. 5s- und 10s-Generation auf Fast und Mini timen
3. Mit erwartetem Wochenvolumen multiplizieren
4. Flagship-Kosten nur für die erwartete Keeper-Rate addieren (z. B. 1 Final pro 8 Drafts)

Wenn Mini den halben Unit-Preis hat, Sie aber bei harten Prompts doppelt so viele Retries brauchen, verliert das „günstige“ Modell. Retries messen, nicht Sticker.

## FAQ

### Ist Seedance 2.0 Mini nur umbenanntes Fast?

Nein. Öffentliche Materialien behandeln sie als getrennte Stufen. Mini zielt auf Kosten und Throughput; Fast auf beschleunigte Generation im 2.0-Stack. Features und Caps unterscheiden sich weiter nach Host.

### Kann Mini 1080p?

Oft nein, oder nicht als First-Class-Angebot. Viele Zusammenfassungen deckeln Mini bei 480p/720p. Für höhere Auflösungsfinals Standard Seedance 2.0 (oder ein anderes High-Tier auf Ihrem Host) einplanen.

### Was sollten Beginner wählen?

Bei knapperem Budget und Prompt-Lernen mit Mini starten. Lieblings-Prompt auf Fast, dann auf Standard 2.0 heben und vergleichen. Diese eine Leiter lehrt mehr als Scorecards lesen.

### Unterstützen Fast und Mini Reference-to-Video?

Auf Plattformen, die die volle 2.0-Familie exposen, ja in irgendeiner Form. Referenzlimits können unter Flagship liegen. Model Card auf max. Bilder, Videos und Audio-Clips prüfen.

### Schadet Mini der Brand-Qualität?

Nur wenn Sie Mini-Outputs als Heroes ohne Quality Gate publishen. Mini für Exploration und Standard 2.0 zum Shippen ist normal, kein fauler Kompromiss.

### Wie hängt das mit Seedance 2.5 auf dieser Site zusammen?

Seedance 2.5 ist eine spätere Produktlinie auf unserer Oberfläche. Fast und Mini hier meinen die **2.0-Familien**-Stufen, die Sie auch über Drittanbieter-APIs erreichen können. Den Modellnamen wählen, den Ihr Generator tatsächlich abrechnet.

## Empfehlung

- **Tägliche Exploration und Bulk-Varianten:** Mini
- **Direction-Sessions, in denen Wartezeit Momentum tötet:** Fast
- **Client-facing oder Paid-Social-Masters:** Standard Seedance 2.0
- **Bestes Default-Pipeline:** Mini- oder Fast-Drafts → Standard-Finals

Speed und Preis zählen erst, nachdem der Shot funktioniert. Billige Meter auf Exploration legen, teure Sekunden für den Take ausgeben, an den Sie schon glauben."""

fastmini_fr = r"""La famille Seedance 2.0 n'est pas un seul modèle avec un badge marketing. Après le lancement de Seedance 2.0 standard en février 2026, ByteDance et les plateformes d'hébergement ont ajouté des paliers plus légers pour la vitesse et le coût. Deux noms reviennent sans cesse dans les chats de production : **Seedance 2.0 Fast** et **Seedance 2.0 Mini**.

Ils résolvent des goulots différents. Fast est le jumeau accéléré du flagship. Mini, apparu plus largement vers mi-juin 2026, est le palier haut débit / bas coût. Ce guide les compare avec des claims publics conservateurs et une lunette workflow. Les tarifs bougent ; vérifiez toujours le compteur de l'hôte que vous payez.

## Tableau de décision rapide

| Besoin | Préférer |
| --- | --- |
| Latence la plus basse pour tests de prompt | Fast ou Mini (Mini gagne souvent en pure vitesse/coût) |
| Volume maximal par dollar | Mini |
| Meilleure qualité de draft avant un pass flagship | Fast (parfois Mini ; juger sur votre contenu) |
| Finals 1080p / polish maximum | Seedance 2.0 standard, pas Mini |
| Références multimodales avec budget plus serré | Mini ou Fast, puis promouvoir les keepers vers standard |

## À quoi sert Fast

Seedance 2.0 Fast est la variante low-latency de l'architecture 2.0. Les hôtes le positionnent pour :

- itération rapide de prompts
- drafts légers avant un rendu final
- workflows qui partagent les contrôles du 2.0 standard mais finissent plus tôt

Les descriptions publiques gardent en général l'idée multimodale (références texte / image / vidéo / audio) tout en échangeant un peu de fidélité contre le turnaround. Les offres de résolution dépendent de l'hôte ; beaucoup listent Fast jusqu'à des sorties classe 720p, parfois plus. Traitez chaque fiche API comme source de vérité.

Utilisez Fast quand le goulot est **l'attente**, pas le **coût unitaire**. Exemple : sessions d'art direction où vous avez besoin de 15 tests de structure en une heure.

## À quoi sert Mini

Seedance 2.0 Mini est le palier economy de la même génération. Les articles tiers publics affirment souvent :

- environ **2× plus rapide** que Fast dans leurs tests ou le copy vendor
- environ **la moitié du coût** de Seedance 2.0 standard sur certains compteurs
- plafonds de sortie autour de **480p / 720p** (pas un tier master cinéma)
- longueurs de clip toujours dans le voisinage short-form **4-15 secondes**
- références multimodales conservées, parfois avec un budget de référence réduit

Lisez cela comme directionnel, pas universel. Les tarifs RMB de ByteDance, les taux USD BytePlus et les API agrégateurs ne correspondent pas toujours. Une erreur récurrente des médias anglophones : mélanger ¥ et $ ; vérifiez la devise avant de budgéter.

Utilisez Mini quand le goulot est **volume × prix** : batches e-commerce, variantes style UGC, cutdowns social, animatics de premier pass.

## Fast vs Mini vs 2.0 standard

Pensez en trois voies :

1. **Seedance 2.0 standard** — fidélité hero, détail plus riche, idéal quand le clip part en final (ou quasi-final) chez un client ou un compte ads.
2. **Fast** — même famille, accéléré ; excellent pour chasser la structure tout en gardant une esthétique de draft solide.
3. **Mini** — voie la moins chère/rapide pour la quantité ; attendez-vous à des plafonds de résolution plus bas et plus d'« ADN draft ».

Échelle pratique adoptée par beaucoup d'équipes :

1. Explorer les beats sur Mini
2. Verrouiller caméra et performance sur Fast (optionnel si Mini suffit déjà)
3. Rendre le keeper sur 2.0 standard
4. N'étendre ou grader que le gagnant

Sauter l'échelle pour des drafts internes va. La sauter pour des finals payants, c'est laisser des mains molles et des labels produit flous entrer dans les pubs.

## Attentes qualité (version honnête)

Les graphiques vendors prétendent parfois que Mini bat Fast en stabilité de motion. Les reviews indépendantes sont mitigées. Votre type de contenu décide plus que le badge :

- Continuité des visages et de la garde-robe : tester les deux avec les mêmes références
- Packshots produit : surveiller le shimmer des bords et la bouillie de logo à 720p
- Danse / sport : Fast peut mieux tenir la forme sur certains hôtes ; Mini peut être « assez bon » pour des thumbnails
- Audio : tous les hôtes 2.0 qui annoncent l'audio natif demandent encore un pass d'écoute ; les paliers moins chers sonnent plus fins

Faites un A/B avec trois prompts fixes avant de réécrire vos docs de pipeline.

## Planification des coûts sans chiffres fantaisie

Au lieu de coller un prix viral à la seconde qui vieillira :

1. Noter l'unité de l'hôte (par seconde, par clip, par crédit)
2. Chronométrer une génération 5s et 10s sur Fast et Mini
3. Multiplier par le volume hebdomadaire attendu
4. Ajouter le coût flagship seulement pour le taux de keeper attendu (par ex. 1 final pour 8 drafts)

Si Mini coûte la moitié à l'unité mais nécessite deux fois plus de retries sur des prompts durs, le modèle « bon marché » perd. Mesurez les retries, pas les stickers.

## FAQ

### Seedance 2.0 Mini n'est-il qu'un Fast renommé ?

Non. Les matériaux publics les traitent comme des paliers distincts. Mini vise coût et débit ; Fast vise la génération accélérée dans la stack 2.0. Features et plafonds diffèrent encore par hôte.

### Mini peut-il faire du 1080p ?

Souvent non, ou pas en offre de premier rang. Beaucoup de synthèses plafonnent Mini à 480p/720p. Pour des finals plus haute résolution, prévoyez Seedance 2.0 standard (ou un autre high tier sur votre hôte).

### Que choisir en débutant ?

Commencez sur Mini si le budget est serré et que vous apprenez le prompting. Montez un prompt favori sur Fast, puis sur 2.0 standard, et comparez. Cette seule échelle enseigne plus que la lecture de scorecards.

### Fast et Mini supportent-ils le reference-to-video ?

Sur les plateformes qui exposent toute la famille 2.0, oui sous une forme ou une autre. Les limites de référence peuvent être plus basses que le flagship. Vérifiez la model card pour le max d'images, vidéos et clips audio.

### Choisir Mini nuira-t-il à la qualité de marque ?

Seulement si vous publiez des sorties Mini comme heroes sans quality gate. Utiliser Mini pour l'exploration et le 2.0 standard pour ship est normal, pas un compromis honteux.

### Lien avec Seedance 2.5 sur ce site ?

Seedance 2.5 est une ligne produit plus tardive sur notre surface. Fast et Mini ici désignent les paliers de la **famille 2.0** que vous pouvez aussi atteindre via des API tierces. Choisissez le nom de modèle que votre générateur facture réellement.

## Recommandation

- **Exploration quotidienne et variantes en volume :** Mini
- **Sessions de direction où l'attente tue le momentum :** Fast
- **Masters client-facing ou paid social :** Seedance 2.0 standard
- **Meilleur pipeline par défaut :** drafts Mini ou Fast → finals standard

La vitesse et le prix ne comptent qu'après que le plan fonctionne. Mettez les compteurs bon marché sur l'exploration, et dépensez les secondes chères sur la prise en laquelle vous croyez déjà."""

fastmini_es = r"""La familia Seedance 2.0 no es un solo modelo con insignia de marketing. Tras el lanzamiento de Seedance 2.0 estándar en febrero de 2026, ByteDance y las plataformas de hosting añadieron niveles más ligeros para velocidad y coste. Dos nombres aparecen sin parar en los chats de producción: **Seedance 2.0 Fast** y **Seedance 2.0 Mini**.

Resuelven cuellos de botella distintos. Fast es el hermano acelerado del flagship. Mini, que se vio más ampliamente hacia mediados de junio de 2026, es el nivel de alto throughput y menor coste. Esta guía los compara con claims públicos conservadores y una lente de workflow. Los precios de plataforma se mueven; comprueba siempre el contador del host que pagas.

## Tabla de decisión rápida

| Necesidad | Preferir |
| --- | --- |
| Menor latencia para tests de prompt | Fast o Mini (Mini a menudo gana en velocidad/coste puro) |
| Máximo volumen por dólar | Mini |
| Mejor calidad de draft antes de un pase flagship | Fast (a veces Mini; juzga en tu contenido) |
| Finales 1080p / máximo polish | Seedance 2.0 estándar, no Mini |
| Referencias multimodales con presupuestos más justos | Mini o Fast, luego promover keepers a estándar |

## Para qué sirve Fast

Seedance 2.0 Fast es la variante de baja latencia de la arquitectura 2.0. Los hosts lo posicionan para:

- iteración rápida de prompts
- drafts ligeros antes de un render final
- workflows que comparten controles con el 2.0 estándar pero terminan antes

Las descripciones públicas suelen mantener la idea multimodal (referencias de texto / imagen / vídeo / audio) intercambiando algo de fidelidad por turnaround. Las ofertas de resolución dependen del host; muchos listan Fast hasta salidas de clase 720p, a veces más. Trata cada ficha de API como fuente de verdad.

Usa Fast cuando el cuello de botella es **esperar**, no el **coste unitario**. Ejemplo: sesiones de art direction donde necesitas 15 tests de estructura en una hora.

## Para qué sirve Mini

Seedance 2.0 Mini es el nivel economy de la misma generación. Los textos públicos de terceros suelen afirmar:

- aproximadamente **2× más rápido** que Fast en sus tests o copy de vendor
- alrededor de la **mitad del coste** de Seedance 2.0 estándar en algunos contadores
- techos de salida en torno a **480p / 720p** (no es un tier master de cine)
- longitudes de clip aún en la vecindad short-form de **4-15 segundos**
- referencias multimodales retenidas, a veces con presupuesto de referencia reducido

Léelo como direccional, no universal. Los precios RMB de ByteDance, las tarifas USD de BytePlus y las API agregadoras no siempre coinciden. Un error recurrente en medios en inglés: mezclar ¥ y $; verifica la moneda antes de presupuestar.

Usa Mini cuando el cuello es **volumen × precio**: lotes de ecommerce, variantes estilo UGC, cutdowns social, animatics de primer pase.

## Fast vs Mini vs 2.0 estándar

Piensa en tres carriles:

1. **Seedance 2.0 estándar** — fidelidad hero, detalle más rico, mejor cuando el clip va a un cliente o cuenta de ads como final (o casi final).
2. **Fast** — misma familia, acelerado; genial para cazar estructura cuando aún quieres estética de draft sólida.
3. **Mini** — carril más barato/rápido para cantidad; espera techos de resolución más bajos y más «ADN de draft».

Escalera práctica que adoptan muchos equipos:

1. Explorar beats en Mini
2. Bloquear cámara y performance en Fast (opcional si Mini ya se ve bien)
3. Renderizar el keeper en 2.0 estándar
4. Extender o graduar solo al ganador

Saltar la escalera para drafts internos está bien. Saltarla en finales de pago es cómo entran manos blandas y etiquetas de producto blandas en los anuncios.

## Expectativas de calidad (versión honesta)

Los charts de vendor a veces afirman que Mini supera a Fast en estabilidad de motion. Las reviews independientes son mixtas. Tu tipo de contenido decide más que la insignia:

- Continuidad de caras y vestuario: prueba ambos con las mismas referencias
- Packshots de producto: vigila shimmer de bordes y mush de logos a 720p
- Baile / deporte: Fast puede sostener mejor la forma en algunos hosts; Mini puede ser «suficiente» para thumbnails
- Audio: todos los hosts 2.0 que anuncian audio nativo siguen necesitando un pase de escucha; los niveles más baratos suenan más finos

Haz un A/B con tres prompts fijos antes de reescribir tus docs de pipeline.

## Planificación de costes sin números de fantasía

En lugar de pegar un precio viral por segundo que envejecerá:

1. Anota la unidad de tu host (por segundo, por clip, por crédito)
2. Cronometra una generación de 5s y 10s en Fast y Mini
3. Multiplica por el volumen semanal esperado
4. Suma el coste flagship solo para la tasa de keeper esperada (por ejemplo 1 final por 8 drafts)

Si Mini cuesta la mitad por unidad pero necesitas el doble de reintentos en prompts duros, el modelo «barato» pierde. Mide reintentos, no pegatinas.

## FAQ

### ¿Seedance 2.0 Mini es solo un Fast renombrado?

No. Los materiales públicos los tratan como niveles separados. Mini apunta a coste y throughput; Fast a generación acelerada dentro del stack 2.0. Features y techos siguen difiriendo por host.

### ¿Puede Mini hacer 1080p?

A menudo no, o no como oferta de primera clase. Muchos resúmenes limitan Mini a 480p/720p. Para finales de mayor resolución, planifica Seedance 2.0 estándar (u otro high tier en tu host).

### ¿Cuál deberían elegir los principiantes?

Empieza en Mini si el presupuesto es justo y estás aprendiendo prompting. Sube un prompt favorito a Fast, luego a 2.0 estándar, y compara. Esa sola escalera enseña más que leer scorecards.

### ¿Fast y Mini soportan reference-to-video?

En plataformas que exponen la familia 2.0 completa, sí de alguna forma. Los límites de referencia pueden ser más bajos que el flagship. Revisa la model card para el máximo de imágenes, vídeos y clips de audio.

### ¿Elegir Mini dañará la calidad de marca?

Solo si publicas salidas Mini como heroes sin quality gate. Usar Mini para exploración y 2.0 estándar para ship es normal, no un compromiso vergonzoso.

### ¿Cómo se relaciona con Seedance 2.5 en este sitio?

Seedance 2.5 es una línea de producto posterior en nuestra superficie. Fast y Mini aquí se refieren a los niveles de la **familia 2.0** a los que también puedes acceder por APIs de terceros. Elige el nombre de modelo que tu generador facture de verdad.

## Recomendación

- **Exploración diaria y variantes en volumen:** Mini
- **Sesiones de dirección donde la espera mata el momentum:** Fast
- **Masters de cara al cliente o paid social:** Seedance 2.0 estándar
- **Mejor pipeline por defecto:** drafts Mini o Fast → finales estándar

La velocidad y el precio solo importan después de que el plano funcione. Pon los contadores baratos en la exploración y gasta los segundos caros en la toma en la que ya crees."""

fastmini_it = r"""La famiglia Seedance 2.0 non è un solo modello con un badge di marketing. Dopo il lancio di Seedance 2.0 standard a febbraio 2026, ByteDance e le piattaforme di hosting hanno aggiunto tier più leggeri per velocità e costo. Due nomi compaiono di continuo nelle chat di produzione: **Seedance 2.0 Fast** e **Seedance 2.0 Mini**.

Risolvono colli di bottiglia diversi. Fast è il fratello accelerato del flagship. Mini, emerso più ampiamente verso metà giugno 2026, è il tier ad alto throughput e basso costo. Questa guida li confronta con claim pubblici conservativi e una lente di workflow. I prezzi di piattaforma si muovono; controlla sempre il meter dell'host che paghi.

## Tabella decisionale rapida

| Esigenza | Preferire |
| --- | --- |
| Latenza più bassa per test di prompt | Fast o Mini (Mini spesso vince su pure velocità/costo) |
| Massimo volume per dollaro | Mini |
| Qualità draft più forte prima di un pass flagship | Fast (a volte Mini; giudica sul tuo contenuto) |
| Final 1080p / massimo polish | Seedance 2.0 standard, non Mini |
| Riferimenti multimodali con budget più stretti | Mini o Fast, poi promuovi i keeper allo standard |

## A cosa serve Fast

Seedance 2.0 Fast è la variante low-latency dell'architettura 2.0. Gli host la posizionano per:

- iterazione rapida di prompt
- draft leggeri prima di un render finale
- workflow che condividono i controlli del 2.0 standard ma finiscono prima

Le descrizioni pubbliche di solito mantengono l'idea multimodale (riferimenti testo / immagine / video / audio) scambiando un po' di fedeltà per il turnaround. Le offerte di risoluzione dipendono dall'host; molti elencano Fast fino a output di classe 720p, a volte più alti. Tratta ogni scheda API come fonte di verità.

Usa Fast quando il collo di bottiglia è **l'attesa**, non il **costo unitario**. Esempio: sessioni di art direction in cui ti servono 15 test di struttura in un'ora.

## A cosa serve Mini

Seedance 2.0 Mini è il tier economy della stessa generazione. Gli articoli pubblici di terze parti affermano spesso:

- circa **2× più veloce** di Fast nei loro test o nel copy vendor
- circa **metà del costo** di Seedance 2.0 standard su alcuni meter
- tetti di output intorno a **480p / 720p** (non un tier master cinema)
- lunghezze clip ancora nel vicinato short-form **4-15 secondi**
- riferimenti multimodali mantenuti, a volte con budget di riferimento ridotto

Leggili come direzionali, non universali. I prezzi RMB di ByteDance, le tariffe USD BytePlus e le API aggregator non sempre combaciano. Un errore ricorrente nei media inglesi: mescolare ¥ e $; verifica la valuta prima di budgettare.

Usa Mini quando il collo è **volume × prezzo**: batch ecommerce, varianti stile UGC, cutdown social, animatic di primo pass.

## Fast vs Mini vs 2.0 standard

Pensa in tre corsie:

1. **Seedance 2.0 standard** — fedeltà hero, dettaglio più ricco, meglio quando la clip va a un cliente o account ads come final (o near-final).
2. **Fast** — stessa famiglia, accelerato; ottimo per cacciare la struttura quando vuoi ancora un'estetica draft solida.
3. **Mini** — corsia più economica/veloce per quantità; aspetta tetti di risoluzione più bassi e più «DNA draft».

Scala pratica adottata da molti team:

1. Esplora i beat su Mini
2. Blocca camera e performance su Fast (opzionale se Mini è già ok)
3. Renderizza il keeper su 2.0 standard
4. Estendi o grada solo il vincitore

Saltare la scala per draft interni va bene. Saltarla per final a pagamento è come far entrare mani morbide e label prodotto sfocate negli ads.

## Aspettative di qualità (versione onesta)

I chart vendor a volte affermano che Mini batte Fast sulla stabilità di motion. Le review indipendenti sono miste. Il tuo tipo di contenuto decide più del badge:

- Continuità di volti e wardrobe: testa entrambi con gli stessi riferimenti
- Packshot prodotto: osserva edge shimmer e mush di loghi a 720p
- Danza / sport: Fast può tenere meglio la forma su alcuni host; Mini può essere «abbastanza» per thumbnail
- Audio: tutti gli host 2.0 che pubblicizzano audio nativo richiedono ancora un pass di ascolto; i tier più economici suonano più sottili

Fai un A/B con tre prompt fissi prima di riscrivere i doc di pipeline.

## Pianificazione costi senza numeri di fantasia

Invece di incollare un prezzo virale al secondo che invecchierà:

1. Nota l'unità del tuo host (al secondo, al clip, al credito)
2. Cronometra una generazione da 5s e 10s su Fast e Mini
3. Moltiplica per il volume settimanale atteso
4. Aggiungi il costo flagship solo per il tasso di keeper atteso (es. 1 final ogni 8 draft)

Se Mini costa metà a unità ma ti servono il doppio dei retry su prompt difficili, il modello «economico» perde. Misura i retry, non gli sticker.

## FAQ

### Seedance 2.0 Mini è solo un Fast rinominato?

No. I materiali pubblici li trattano come tier separati. Mini punta a costo e throughput; Fast a generazione accelerata nello stack 2.0. Feature e cap differiscono ancora per host.

### Mini può fare 1080p?

Spesso no, o non come offerta di prima classe. Molte sintesi limitano Mini a 480p/720p. Per final a risoluzione più alta, pianifica Seedance 2.0 standard (o un altro high tier sul tuo host).

### Cosa dovrebbero scegliere i principianti?

Parti da Mini se il budget è stretto e stai imparando il prompting. Porta un prompt preferito su Fast, poi su 2.0 standard, e confronta. Quella sola scala insegna più della lettura di scorecard.

### Fast e Mini supportano reference-to-video?

Sulle piattaforme che espongono l'intera famiglia 2.0, sì in qualche forma. I limiti di riferimento possono essere inferiori al flagship. Controlla la model card per max immagini, video e clip audio.

### Scegliere Mini danneggerà la qualità di brand?

Solo se pubblichi output Mini come hero senza quality gate. Usare Mini per l'esplorazione e 2.0 standard per lo ship è normale, non un compromesso vergognoso.

### Come si collega a Seedance 2.5 su questo sito?

Seedance 2.5 è una linea prodotto successiva sulla nostra superficie. Fast e Mini qui si riferiscono ai tier della **famiglia 2.0** a cui puoi accedere anche via API di terze parti. Scegli il nome modello che il tuo generatore fattura davvero.

## Raccomandazione

- **Esplorazione quotidiana e varianti bulk:** Mini
- **Sessioni di direction in cui l'attesa uccide lo slancio:** Fast
- **Master client-facing o paid social:** Seedance 2.0 standard
- **Miglior pipeline di default:** draft Mini o Fast → final standard

Velocità e prezzo contano solo dopo che lo shot funziona. Metti i meter economici sull'esplorazione e spendi i secondi costosi sulla take in cui credi già."""

fastmini_pl = r"""Rodzina Seedance 2.0 to nie jeden model z marketingowym badge'em. Po premierze standardowego Seedance 2.0 w lutym 2026 ByteDance i platformy hostingowe dodały lżejsze tiery pod szybkość i koszt. Dwa nazwy ciągle wracają w czatach produkcyjnych: **Seedance 2.0 Fast** i **Seedance 2.0 Mini**.

Rozwiązują różne wąskie gardła. Fast to przyspieszony rodzeństwo flagowca. Mini, które szerzej pojawiło się około połowy czerwca 2026, to tier wysokiego throughputu i niższego kosztu. Ten przewodnik porównuje je z konserwatywnymi publicznymi claimami i optyką workflow. Ceny platform się ruszają — zawsze sprawdzaj licznik hosta, za którego płacisz.

## Szybka tabela decyzyjna

| Potrzeba | Preferuj |
| --- | --- |
| Najniższa latencja przy testach promptu | Fast lub Mini (Mini często wygrywa czystą prędkością/kosztem) |
| Największy wolumen na dolara | Mini |
| Silniejsza jakość draftu przed passem flagowym | Fast (czasem Mini; oceniaj na swoim contentcie) |
| Final 1080p / maksymalne polish | Standard Seedance 2.0, nie Mini |
| Referencje multimodalne przy ciaśniejszym budżecie | Mini lub Fast, potem promote keeperów na standard |

## Do czego jest Fast

Seedance 2.0 Fast to wariant low-latency architektury 2.0. Hosty pozycjonują go pod:

- szybką iterację promptów
- lekkie drafty przed finalnym renderem
- workflowy dzielące kontrole ze standardem 2.0, ale kończące się wcześniej

Publiczne opisy zwykle zachowują ideę multimodalną (referencje tekst / obraz / wideo / audio), wymieniając trochę wierności na turnaround. Oferty rozdzielczości zależą od hosta; wiele listuje Fast do wyjść klasy 720p, czasem wyżej. Traktuj każdą kartę API jako source of truth.

Używaj Fast, gdy wąskim gardłem jest **czekanie**, nie **koszt jednostkowy**. Przykład: sesje art direction, w których potrzebujesz 15 testów struktury w godzinę.

## Do czego jest Mini

Seedance 2.0 Mini to tier economy tej samej generacji. Publiczne teksty trzecich stron często twierdzą:

- mniej więcej **2× szybciej** niż Fast w ich testach lub copy vendora
- około **połowy kosztu** standardowego Seedance 2.0 na niektórych licznikach
- sufity wyjścia około **480p / 720p** (nie tier master kina)
- długości klipów nadal w okolicy short-form **4-15 sekund**
- zachowane referencje multimodalne, czasem ze zmniejszonym budżetem referencji

Czytaj to jako kierunkowe, nie uniwersalne. Ceny RMB ByteDance, stawki USD BytePlus i API aggregatorów nie zawsze się zgadzają. Powtarzający się błąd angielskich mediów: mieszanie ¥ i $ — sprawdź walutę przed budżetem.

Używaj Mini, gdy wąskim gardłem jest **wolumen × cena**: batche ecommerce, warianty w stylu UGC, social cutdowny, animatics pierwszego passu.

## Fast vs Mini vs standard 2.0

Myśl trzema pasami:

1. **Standard Seedance 2.0** — hero fidelity, bogatszy detal, najlepiej gdy klip idzie do klienta lub konta ads jako final (lub near-final).
2. **Fast** — ta sama rodzina, przyspieszona; świetna do polowania na strukturę, gdy chcesz jeszcze solidną estetykę draftu.
3. **Mini** — najtańszy/najszybszy pas na ilość; spodziewaj się niższych sufitów rozdzielczości i więcej „DNA draftu”.

Praktyczna drabina, którą przyjmuje wiele zespołów:

1. Eksploruj beaty na Mini
2. Zablokuj kamerę i performance na Fast (opcjonalnie, jeśli Mini już wygląda dobrze)
3. Renderuj keepers na standard 2.0
4. Extend lub grade tylko zwycięzcę

Pomijanie drabiny przy draftach wewnętrznych jest OK. Pomijanie jej przy płatnych finalach to sposób, by miękkie dłonie i rozmazane etykiety produktów weszły w reklamy.

## Oczekiwania jakości (wersja uczciwa)

Wykresy vendorów czasem twierdzą, że Mini bije Fast w stabilności ruchu. Niezależne recenzje są mieszane. Twój typ contentu decyduje więcej niż badge:

- Ciągłość twarzy i garderoby: testuj oba z tymi samymi referencjami
- Packshoty produktu: pilnuj shimmer krawędzi i mush logo przy 720p
- Taniec / sport: Fast może lepiej trzymać formę na niektórych hostach; Mini bywa „wystarczający” do thumbnaili
- Audio: wszystkie hosty 2.0 z natywnym audio wciąż wymagają passu odsłuchu; tańsze tiery brzmią cieńszy

Zrób A/B z trzema stałymi promptami, zanim przepiszesz docs pipeline'u.

## Planowanie kosztów bez fantastycznych liczb

Zamiast wklejać wirusową cenę za sekundę, która się zestarzeje:

1. Zanotuj jednostkę hosta (na sekundę, na klip, na credit)
2. Zmierz generację 5s i 10s na Fast i Mini
3. Pomnóż przez oczekiwany tygodniowy wolumen
4. Dodaj koszt flagowca tylko dla oczekiwanej stopy keeperów (np. 1 final na 8 draftów)

Jeśli Mini ma połowę ceny jednostkowej, ale na trudnych promptach potrzebujesz dwa razy więcej retry, „tani” model przegrywa. Mierz retry, nie naklejki.

## FAQ

### Czy Seedance 2.0 Mini to tylko przemianowany Fast?

Nie. Publiczne materiały traktują je jako osobne tiery. Mini celuje w koszt i throughput; Fast w przyspieszoną generację w stacku 2.0. Features i capy nadal różnią się per host.

### Czy Mini robi 1080p?

Często nie, albo nie jako oferta first-class. Wiele podsumowań limituje Mini do 480p/720p. Na finaly wyższej rozdzielczości planuj standard Seedance 2.0 (lub inny high tier na swoim hoście).

### Co powinni wybrać początkujący?

Zacznij od Mini, jeśli budżet jest ciasny i uczysz się promptowania. Przenieś ulubiony prompt na Fast, potem na standard 2.0 i porównaj. Ta jedna drabina uczy więcej niż czytanie scorecardów.

### Czy Fast i Mini wspierają reference-to-video?

Na platformach, które eksponują pełną rodzinę 2.0, tak w jakiejś formie. Limity referencji mogą być niższe niż u flagowca. Sprawdź model card pod max obrazów, wideo i klipów audio.

### Czy wybór Mini zaszkodzi jakości brandu?

Tylko jeśli publikujesz wyjścia Mini jako hero bez quality gate. Mini do eksploracji i standard 2.0 do shipa to normalność, nie wstydliwy kompromis.

### Jak to się ma do Seedance 2.5 na tej stronie?

Seedance 2.5 to późniejsza linia produktu na naszej powierzchni. Fast i Mini tutaj oznaczają tiery **rodziny 2.0**, do których możesz też dojść przez API firm trzecich. Wybierz nazwę modelu, którą twój generator realnie rozlicza.

## Rekomendacja

- **Codzienna eksploracja i bulk wariantów:** Mini
- **Sesje direction, gdzie czekanie zabija momentum:** Fast
- **Mastery client-facing lub paid social:** standard Seedance 2.0
- **Najlepszy domyślny pipeline:** drafty Mini lub Fast → finaly standard

Szybkość i cena mają znaczenie dopiero, gdy ujęcie działa. Tanie liczniki daj eksploracji, a drogie sekundy wydaj na take, w którą już wierzysz."""

fastmini_ja = r"""Seedance 2.0ファミリーは、マーケ用バッジが付いただけの1モデルではありません。2026年2月の標準Seedance 2.0ローンチ後、ByteDanceとホスティング各社は速度とコスト向けの軽いティアを追加しました。制作チャットで常に出る2つの名前が **Seedance 2.0 Fast** と **Seedance 2.0 Mini** です。

それぞれ別のボトルネックを解きます。Fastはフラッグシップの加速版。Miniは2026年6月中旬ごろにより広く現れ、高スループット・低コスト層です。本ガイドは保守的な公開クレームとワークフロー視点で比較します。プラットフォーム価格は動くので、支払うホストのメーターを常に確認してください。

## クイック判断表

| ニーズ | 優先 |
| --- | --- |
| プロンプトテストの最低レイテンシ | FastまたはMini（純粋な速度/コストではMiniが勝つことが多い） |
| 1ドルあたり最大ボリューム | Mini |
| フラッグシップ前のより強いドラフト品質 | Fast（時にMini。自分のコンテンツで判断） |
| 1080p / 最大ポリッシュの最終稿 | 標準Seedance 2.0。Miniではない |
| 予算がタイトなマルチモーダル参照 | MiniまたはFast → キーパーを標準へ昇格 |

## Fastの用途

Seedance 2.0 Fastは2.0アーキテクチャの低レイテンシ版です。ホストは次の用途に位置づけます。

- 高速なプロンプト反復
- 最終レンダ前の軽いドラフト
- 標準2.0とコントロールを共有しつつ早く終わるワークフロー

公開記述はおおむねマルチモーダルの考え方（テキスト/画像/動画/音声参照）を保ちつつ、忠実度の一部をターンアラウンドと交換します。解像度の提供はホスト次第で、多くはFastを720pクラスまで、時にそれ以上と記載。各APIカードを正とします。

ボトルネックが**単価**ではなく**待ち時間**のときにFastを使います。例：1時間に15回の構造テストが必要なアートディレクション。

## Miniの用途

Seedance 2.0 Miniは同世代のエコノミー層です。公開の第三者記事はよく次を主張します。

- 自社テストやベンダー文言でFastよりおおよそ**2倍速い**
- 一部メーターで標準Seedance 2.0の約**半額**
- 出力上限はおおよそ**480p / 720p**（シネママスター層ではない）
- クリップ尺は依然ショートフォームの**4〜15秒**近辺
- マルチモーダル参照は維持。ホストによっては参照予算が小さめ

方向性として読み、普遍の事実としないこと。ByteDanceの人民元価格、BytePlusのUSD料金、集約APIは一致しないことがあります。英語メディアでよくある誤りは¥と$の混同。予算前に通貨を確認。

ボトルネックが**量 × 価格**のときMiniを使います。ECバッチ、UGC風バリエーション、SNS用カットダウン、一次アニマティクス。

## Fast vs Mini vs 標準2.0

3レーンで考える：

1. **標準Seedance 2.0** — ヒーロー忠実度、より豊かなディテール。クライアントや広告アカウントへ最終（またはほぼ最終）として出すとき向き。
2. **Fast** — 同ファミリーの加速版。ドラフト美観も欲しい構造探しに強い。
3. **Mini** — 量向けの最安/最速レーン。解像度上限が低く、「ドラフトDNA」が多いと想定。

多くのチームが採る実務ラダー：

1. Miniでビートを探る
2. Fastでカメラと演技をロック（Miniで十分なら省略可）
3. キーパーを標準2.0でレンダ
4. 勝者だけを延長またはグレーディング

内部ドラフトでラダーを飛ばすのは問題なし。有料最終で飛ばすと、柔らかい手やボヤけた製品ラベルが広告に入り込みます。

## 品質期待（正直版）

ベンダー図はMiniがモーション安定でFastを上回ると主張することがあります。独立レビューはまちまちです。バッジよりコンテンツ種別が決めます。

- 顔と衣装の連続性：同じ参照で両方テスト
- 製品パックショット：720pでのエッジシマーとロゴの溶けに注意
- ダンス/スポーツ：ホストによってはFastが形を保ちやすい。Miniはサムネ用に「十分」なことも
- 音声：ネイティブ音声をうたう2.0ホストはすべて試聴パスが必要。安いティアは薄く聞こえがち

パイプライン文書を書き換える前に、固定プロンプト3本でA/Bを。

## 空想数字なしのコスト計画

すぐ古くなるバイラルな秒単価を貼る代わりに：

1. ホストの単位をメモ（秒 / クリップ / クレジット）
2. FastとMiniで5秒と10秒生成を計測
3. 週次想定ボリュームを掛ける
4. 想定キーパー率だけフラッグシップ費用を加算（例：ドラフト8に最終1）

Miniが半額でも、難しいプロンプトでリトライが2倍なら「安い」モデルは負けます。ステッカーではなくリトライを測る。

## FAQ

### Seedance 2.0 Miniは名前を変えたFastですか？

いいえ。公開資料は別ティアとして扱います。Miniはコストとスループット、Fastは2.0スタック内の加速生成。機能と上限はホストごとになお異なります。

### Miniは1080pできますか？

多くの場合ノー、または第一級の提供ではない。要約の多くはMiniを480p/720pに制限。より高解像度の最終は標準Seedance 2.0（またはホストの他ハイティア）を計画。

### 初心者はどれを？

予算が厳しくプロンプト学習中ならMiniから。お気に入りプロンプトをFast、次に標準2.0へ上げて比較。この1本のラダーがスコアカードより教えます。

### FastとMiniはreference-to-videoに対応しますか？

2.0ファミリー全体を出すプラットフォームでは、何らかの形で対応。参照上限はフラッグシップより低い場合あり。モデルカードで画像・動画・音声の最大数を確認。

### Miniを選ぶとブランド品質が落ちますか？

品質ゲートなしにMini出力をヒーローとして出す場合のみ。探索はMini、出荷は標準2.0が普通で、妥協ではありません。

### このサイトのSeedance 2.5との関係は？

Seedance 2.5は当社サーフェス上の後続プロダクトライン。ここでのFast/Miniは、第三者API経由でも触れる**2.0ファミリー**のティアです。実際に課金されるモデル名を選んでください。

## 推奨

- **日々の探索と大量バリエーション：** Mini
- **待ち時間が勢いを殺すディレクション：** Fast
- **クライアント向け／有料SNSマスター：** 標準Seedance 2.0
- **既定パイプラインの最適解：** MiniまたはFastドラフト → 標準最終

速度と価格が意味を持つのはショットが通った後です。安いメーターは探索に、高い秒数はすでに信じているテイクに使ってください。"""

fastmini_ko = r"""Seedance 2.0 패밀리는 마케팅 배지가 붙은 단일 모델이 아닙니다. 2026년 2월 표준 Seedance 2.0 출시 이후 ByteDance와 호스팅 플랫폼은 속도와 비용을 위한 더 가벼운 티어를 추가했습니다. 제작 채팅에서 끊임없이 등장하는 두 이름은 **Seedance 2.0 Fast**와 **Seedance 2.0 Mini**입니다.

서로 다른 병목을 풉니다. Fast는 플래그십의 가속 형제입니다. Mini는 2026년 6월 중순 무렵 더 넓게 등장한 고처리량·저비용 티어입니다. 이 가이드는 보수적인 공개 클레임과 워크플로 관점으로 비교합니다. 플랫폼 가격은 움직이므로, 결제하는 호스트의 미터를 항상 확인하세요.

## 빠른 결정 표

| 필요 | 우선 |
| --- | --- |
| 프롬프트 테스트용 최저 지연 | Fast 또는 Mini(순수 속도/비용에서는 Mini가 자주 우위) |
| 달러당 최대 볼륨 | Mini |
| 플래그십 패스 전 더 강한 드래프트 품질 | Fast(때로 Mini; 콘텐츠로 판단) |
| 1080p / 최대 폴리시 최종 | 표준 Seedance 2.0, Mini 아님 |
| 예산이 빠듯한 멀티모달 참조 | Mini 또는 Fast 후 키퍼를 표준으로 승격 |

## Fast의 용도

Seedance 2.0 Fast는 2.0 아키텍처의 저지연 변형입니다. 호스트는 다음 용도로 포지셔닝합니다.

- 빠른 프롬프트 반복
- 최종 렌더 전 가벼운 드래프트
- 표준 2.0과 컨트롤을 공유하되 더 빨리 끝나는 워크플로

공개 설명은 대개 멀티모달 아이디어(텍스트/이미지/비디오/오디오 참조)를 유지하며 충실도의 일부를 턴어라운드와 맞바꿉니다. 해상도 제공은 호스트에 달리고, 많은 곳이 Fast를 720p급까지(때로 더 높게) 표시합니다. 각 API 카드를 정본으로 삼으세요.

병목이 **단가**가 아니라 **대기**일 때 Fast를 쓰세요. 예: 한 시간에 구조 테스트 15회가 필요한 아트 디렉션 세션.

## Mini의 용도

Seedance 2.0 Mini는 같은 세대의 이코노미 티어입니다. 공개 서드파티 글은 흔히 다음을 주장합니다.

- 자체 테스트나 벤더 카피에서 Fast보다 대략 **2배 빠름**
- 일부 미터에서 표준 Seedance 2.0의 약 **절반 비용**
- 출력 상한 대략 **480p / 720p**(시네마 마스터 티어 아님)
- 클립 길이는 여전히 숏폼 **4–15초** 근처
- 멀티모달 참조 유지, 일부 호스트는 참조 예산이 축소

방향성으로 읽고 보편 사실로 취급하지 마세요. ByteDance RMB 가격, BytePlus USD 요금, 집계 API는 항상 일치하지 않습니다. 영어 미디어의 반복 실수는 ¥와 $ 혼동. 예산 전에 통화를 확인하세요.

병목이 **볼륨 × 가격**일 때 Mini를 쓰세요. 이커머스 배치, UGC형 변주, 소셜 컷다운, 1차 애너매틱.

## Fast vs Mini vs 표준 2.0

세 차선으로 생각하세요.

1. **표준 Seedance 2.0** — 히어로 충실도, 더 풍부한 디테일. 클라이언트·광고 계정에 최종(또는 거의 최종)으로 나갈 때 최적.
2. **Fast** — 같은 패밀리의 가속형. 드래프트 미학도 원할 때 구조 탐색에 강함.
3. **Mini** — 양 중심의 가장 저렴/빠른 차선. 더 낮은 해상도 상한과 더 많은 "드래프트 DNA"를 예상.

많은 팀이 채택하는 실무 사다리:

1. Mini로 비트 탐색
2. Fast로 카메라와 퍼포먼스 잠금(Mini가 이미 좋으면 생략 가능)
3. 키퍼를 표준 2.0으로 렌더
4. 승자만 익스텐드 또는 그레이드

내부 드래프트에서 사다리를 건너뛰는 것은 괜찮습니다. 유료 최종에서 건너뛰면 부드러운 손과 뭉개진 제품 라벨이 광고에 들어갑니다.

## 품질 기대(정직한 버전)

벤더 차트는 때로 Mini가 모션 안정성에서 Fast를 이긴다고 주장합니다. 독립 리뷰는 엇갈립니다. 배지보다 콘텐츠 유형이 더 결정적입니다.

- 얼굴·의상 연속성: 같은 참조로 둘 다 테스트
- 제품 팩샷: 720p에서 가장자리 시머와 로고 뭉개짐 주시
- 댄스/스포츠: 일부 호스트에서 Fast가 형태를 더 잘 유지. Mini는 썸네일용으로 "충분"할 수 있음
- 오디오: 네이티브 오디오를 광고하는 모든 2.0 호스트는 청취 패스가 필요. 저가 티어는 더 얇게 들릴 수 있음

파이프라인 문서를 고치기 전에 고정 프롬프트 3개로 A/B를 하세요.

## 환상 숫자 없는 비용 계획

금방 낡는 바이럴 초당 가격을 붙이는 대신:

1. 호스트 단위 기록(초 / 클립 / 크레딧)
2. Fast와 Mini에서 5초·10초 생성 시간 측정
3. 주간 예상 볼륨을 곱함
4. 예상 키퍼 비율에만 플래그십 비용 가산(예: 드래프트 8당 최종 1)

Mini가 단가 절반이어도 어려운 프롬프트에서 재시도가 두 배면 "싼" 모델이 집니다. 스티커가 아니라 재시도를 재세요.

## FAQ

### Seedance 2.0 Mini는 이름만 바꾼 Fast인가요?

아니요. 공개 자료는 별도 티어로 다룹니다. Mini는 비용과 처리량, Fast는 2.0 스택 안 가속 생성. 기능과 상한은 호스트마다 여전히 다릅니다.

### Mini가 1080p를 하나요?

자주 아니거나, 1급 제공이 아닙니다. 많은 요약이 Mini를 480p/720p로 제한합니다. 더 높은 해상도 최종은 표준 Seedance 2.0(또는 호스트의 다른 하이 티어)을 계획하세요.

### 초보자는 무엇을 고를까요?

예산이 빠듯하고 프롬프트를 배우는 중이면 Mini부터. 좋아하는 프롬프트를 Fast, 다음 표준 2.0으로 올려 비교하세요. 그 한 사다리가 스코어카드 읽기보다 많이 가르칩니다.

### Fast와 Mini가 reference-to-video를 지원하나요?

전체 2.0 패밀리를 노출하는 플랫폼에서는 어떤 형태로든 예. 참조 한도는 플래그십보다 낮을 수 있습니다. 모델 카드에서 이미지·비디오·오디오 최대 수를 확인하세요.

### Mini를 고르면 브랜드 품질이 해칠까요?

품질 게이트 없이 Mini 출력을 히어로로 게시할 때만. 탐색은 Mini, 출하는 표준 2.0이 정상이며 타협이 아닙니다.

### 이 사이트의 Seedance 2.5와 관계는?

Seedance 2.5는 우리 표면의 이후 제품 라인입니다. 여기 Fast/Mini는 서드파티 API로도 접근할 수 있는 **2.0 패밀리** 티어를 가리킵니다. 생성기가 실제로 청구하는 모델 이름을 고르세요.

## 권장

- **일상 탐색과 대량 변주:** Mini
- **대기가 모멘텀을 죽이는 디렉션 세션:** Fast
- **클라이언트용 또는 유료 소셜 마스터:** 표준 Seedance 2.0
- **기본 파이프라인 최적:** Mini 또는 Fast 드래프트 → 표준 최종

속도와 가격은 샷이 통과한 뒤에야 의미가 있습니다. 싼 미터는 탐색에 두고, 비싼 초는 이미 믿는 테이크에 쓰세요."""

data = {
    "seedance-2-0-features-overview": {
        "de": features_de,
        "fr": features_fr,
        "es": features_es,
        "it": features_it,
        "pl": features_pl,
        "ja": features_ja,
        "ko": features_ko,
    },
    "seedance-2-0-creative-workflows": {
        "de": workflows_de,
        "fr": workflows_fr,
        "es": workflows_es,
        "it": workflows_it,
        "pl": workflows_pl,
        "ja": workflows_ja,
        "ko": workflows_ko,
    },
    "seedance-2-0-fast-vs-mini": {
        "de": fastmini_de,
        "fr": fastmini_fr,
        "es": fastmini_es,
        "it": fastmini_it,
        "pl": fastmini_pl,
        "ja": fastmini_ja,
        "ko": fastmini_ko,
    },
}

OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# Report
print(f"Wrote {OUT}")
print()
for slug, langs in data.items():
    print(f"## {slug}")
    for lang, body in langs.items():
        # quality checks
        has_faq = "## FAQ" in body or "## よくある" in body or "FAQ" in body
        has_table = "|" in body
        forbidden = any(
            x in body
            for x in (
                "## Related reading",
                "## Try it",
                "## Lectures associées",
                "## Essays-en",
                "## Lecturas relacionadas",
                "## Letture correlate",
                "## Powiązane",
                "## 関連",
                "## 관련 읽기",
            )
        )
        print(
            f"  {lang}: {len(body):5d} chars | FAQ={has_faq} | table={has_table} | no_related_cta={not forbidden}"
        )
    print()
