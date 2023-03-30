import imagemin from "imagemin";
import imageminJpegtran from "imagemin-jpegtran";
import imageminPngquant from "imagemin-pngquant";

// Add `"type": "module",` in package.json for running this...
// https://github.com/imagemin/imagemin/issues/380

const main = async () => {
  const files = await imagemin(["client/img/**/1/*.{jpg,png}"], {
    destination: "build/images/",
    plugins: [
      imageminJpegtran(),
      imageminPngquant({
        strip: true,
        quality: [0.6, 0.8],
      }),
    ],
  });

  return files;
};

main();
