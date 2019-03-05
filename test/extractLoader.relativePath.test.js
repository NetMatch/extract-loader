/* eslint-disable promise/always-return, promise/prefer-await-to-then */
import path from "path";
import rimRaf from "rimraf";
import chai, {expect} from "chai";
import chaiFs from "chai-fs";
import compile from "./support/compile";
import compileNested from "./support/compileNested";

chai.use(chaiFs);

describe("extractLoader - Relative Paths", () => {
    // Using beforeEach so that we can inspect the test compilation afterwards
    beforeEach(() => {
        rimRaf.sync(path.resolve(__dirname, "dist"));
    });
    it("should work when all files are written to the same folder", () =>
        compile({
            testModule: "stylesheet.html",
            loaderOptions: {useOutputPathForRelative: true},
        }).then(() => {
            const styleHtml = path.resolve(__dirname, "dist/stylesheet-dist.html");
            const imgJpg = path.resolve(__dirname, "dist/hi-dist.jpg");
            const imgCss = path.resolve(__dirname, "dist/img-dist.css");

            expect(imgCss).to.be.a.file();
            expect(imgJpg).to.be.a.file();
            expect(styleHtml).to.be.a.file();
            expect(styleHtml).to.have.content.that.match(/<link href="img-dist\.css"/);
            expect(styleHtml).to.have.content.that.match(/<img src="hi-dist\.jpg">/);
        })
    );
    it("should resolve relative paths correctly when handling nested folders", () =>
        compileNested({
            testModule: "deep.html",
            loaderOptions: {useOutputPathForRelative: true},
        }).then(() => {
            const deepHtml = path.resolve(__dirname, "dist/nested/content/deep-dist.html");
            const imgJpg = path.resolve(__dirname, "dist/images/hi-dist.jpg");
            const imgCss = path.resolve(__dirname, "dist/nested/style/css/deep-dist.css");

            expect(imgCss).to.be.a.file();

            expect(imgJpg).to.be.a.file();
            expect(imgCss).to.have.content.that.match(/ url\(..\/..\/..\/images\/hi-dist\.jpg\);/);
            expect(deepHtml).to.be.a.file();
            expect(deepHtml).to.have.content.that.match(/<link href="..\/style\/css\/deep-dist\.css"/);
            expect(deepHtml).to.have.content.that.match(/<img src="..\/..\/images\/hi-dist\.jpg">/);
        })
    );
});
