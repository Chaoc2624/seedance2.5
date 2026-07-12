# Seedance Reference Media

This context defines the vocabulary for reference media in the Seedance video
composer. It keeps the upload and preview interactions consistent across the
homepage composer and video generator.

## Language

**Static reference state**:
The reference-media state shown without a hovered image. It presents an empty
image entry and an empty video entry as a compact, oppositely angled pair. If
image references exist, the first image carries the upload hint instead.
_Avoid_: Default state, collapsed upload state

**Empty media pair**:
The two independently actionable image and video entry cards shown before any
reference media is uploaded. Their positions share one coordinate layer; they
are not sequential flow items.
_Avoid_: Combined uploader, upload-card row

**Primary upload hint**:
The plus control over the first visible image in the static reference state.
It indicates that image references can be added without permanently showing an
image upload placeholder.
_Avoid_: Preview plus, persistent image add card

**Inline upload card**:
The final card in an expanded image or video accordion when the selected model
still accepts another reference. It uses the same offset, rotation, and hover
behavior as media thumbnails.
_Avoid_: Adjacent upload slot, separate upload deck

**Video reference poster**:
The first frame extracted from an uploaded reference video. It is rendered in
the collapsed card and preview-dialog rail before playback is ready; the dialog
uses it as the video's poster and starts the selected clip muted.
_Avoid_: VIDEO text placeholder, blank video thumbnail

**Static deck footprint**:
The collapsed, visible width of a media accordion used to anchor its neighboring
media group. It remains one card wide; additional thumbnails share the initial
horizontal origin and only use rotation plus subtle vertical offsets, so they
never encroach on the neighboring video entry.
_Avoid_: Reserved expansion width, hover layout width

**Reference hover state**:
The state entered when one uploaded reference image is hovered. The active card
is promoted without resizing or reordering uploaded cards. It remains anchored
under the pointer while only following cards fan apart; the image-add card
occupies the shared expanded endpoint.
_Avoid_: Expanded upload state, selected card state
