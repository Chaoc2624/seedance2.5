import { forwardRef, type ImgHTMLAttributes } from 'react';

export interface AppImageProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'alt'
> {
  src: string;
  alt: string;
}

export const AppImage = forwardRef<HTMLImageElement, AppImageProps>(
  function AppImage({ loading = 'lazy', decoding = 'async', ...props }, ref) {
    return <img ref={ref} loading={loading} decoding={decoding} {...props} />;
  }
);

export default AppImage;
