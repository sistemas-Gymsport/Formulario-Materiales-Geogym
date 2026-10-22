import { Box, Brush, Bug, Coffee, Cross, Droplets, Dumbbell, FlaskConical, HandHeart, Lightbulb, Package, PencilRuler, Shirt, SprayCan, Trash2, Wrench } from 'lucide-react';

export const ICON_MAP = {
  'pencil-ruler': PencilRuler,
  'hand-heart': HandHeart,
  'flask-conical': FlaskConical,
  brush: Brush,
  'trash-2': Trash2,
  bug: Bug,
  package: Package,
  'spray-can': SprayCan,
  droplets: Droplets,
  shirt: Shirt,
  wrench: Wrench,
  lightbulb: Lightbulb,
  coffee: Coffee,
  cross: Cross,
  dumbbell: Dumbbell,
  box: Box
};

export const CategoryIcon = ({ name, size = 20, ...props }) => {
  const Icon = ICON_MAP[name] ?? Package;
  return <Icon size={size} aria-hidden="true" {...props} />;
};
