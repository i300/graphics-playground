/**
 * Type definitions for GLSL shader imports
 * Allows TypeScript to import .glsl, .vert, and .frag files as strings
 */

declare module "*.glsl" {
  const value: string;
  export default value;
}

declare module "*.vert" {
  const value: string;
  export default value;
}

declare module "*.frag" {
  const value: string;
  export default value;
}

declare module "*.vs" {
  const value: string;
  export default value;
}

declare module "*.fs" {
  const value: string;
  export default value;
}
