export const categories = [
  { id: 'leaves', name: 'Leaves', subtitle: 'Small shapes, endless details', focus: 'Outline · edges · veins', tone: 'leaf', icon: 'leaf', task: 'Find one accessible leaf. Draw its outline, then add one detail you can actually see.', features: ['outline', 'edge', 'veins', 'tip_base', 'proportion', 'texture'] },
  { id: 'flowers', name: 'Flowers', subtitle: 'Follow the petals', focus: 'Petals · overlap · stems', tone: 'flower', icon: 'flower', task: 'Choose a flower you can see clearly. Sketch its overall shape and how the visible petals overlap.', features: ['outline', 'overlap', 'proportion', 'texture', 'shadow'] },
  { id: 'trees', name: 'Trees', subtitle: 'See the bigger picture', focus: 'Branches · canopy · gaps', tone: 'tree', icon: 'tree', task: 'Choose a tree from one viewpoint. Draw its trunk and canopy as a few large shapes. Notice the gaps between branches.', features: ['outline', 'branching', 'negative_space', 'proportion', 'shadow'] },
  { id: 'bark', name: 'Bark & textures', subtitle: 'A whole world up close', focus: 'Ridges · cracks · patterns', tone: 'bark', icon: 'texture', task: 'Look at a small patch of bark. Sketch the direction and spacing of a few ridges or cracks.', features: ['texture', 'edge', 'shadow', 'proportion'] },
  { id: 'rocks', name: 'Rocks', subtitle: 'Find beauty in the ordinary', focus: 'Contours · planes · shadows', tone: 'rock', icon: 'rock', task: 'Choose a rock you can observe without moving it. Draw its contour and the boundary between two visible surfaces.', features: ['outline', 'planes', 'texture', 'shadow', 'proportion'] },
  { id: 'scenes', name: 'Outdoor scenes', subtitle: 'Make a little room for wonder', focus: 'Depth · scale · overlap', tone: 'scene', icon: 'scene', task: 'Frame a small view of a park or garden. Sketch three large shapes and notice which objects overlap.', features: ['outline', 'depth', 'overlap', 'negative_space', 'proportion', 'shadow'] },
] as const;
export type CategoryId = typeof categories[number]['id'];
export const categoryIds = categories.map(c => c.id) as [CategoryId, ...CategoryId[]];
export function categoryById(id: CategoryId) { return categories.find(c => c.id === id)!; }
export const intents = ['observation', 'shapes', 'texture'] as const;
