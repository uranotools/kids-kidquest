/**
 * JsonLive IIFE — React via window.__URANO_JSONLIVE__.
 */
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const watch = process.argv.includes('--watch');
const footer = `(function(){var p=window.__URANO_JSONLIVE_PENDING__;var j=window.__URANO_JSONLIVE__;if(p&&j&&typeof __UranoMcpWidgetExports!=='undefined'){j.acceptBundle(p.moduleId,__UranoMcpWidgetExports,p.types);}})();`;
const outfile = path.join(root, 'dist', 'ui', 'widgets.js');
fs.mkdirSync(path.dirname(outfile), { recursive: true });

function copyToUiRoot() {
    fs.mkdirSync(path.join(root, 'ui'), { recursive: true });
    fs.copyFileSync(outfile, path.join(root, 'ui', 'widgets.js'));
}

const opts = {
    entryPoints: [path.join(root, 'ui', 'src', 'index.ts')],
    bundle: true,
    format: 'iife',
    globalName: '__UranoMcpWidgetExports',
    platform: 'browser',
    outfile,
    jsx: 'automatic',
    alias: {
        react: path.join(root, 'ui', 'shims', 'react.ts'),
        'react-dom': path.join(root, 'ui', 'shims', 'react.ts'),
        'react/jsx-runtime': path.join(root, 'ui', 'shims', 'jsx-runtime.ts'),
    },
    footer: { js: footer },
    logLevel: 'info',
    plugins: [
        {
            name: 'copy-ui-root',
            setup(build) {
                build.onEnd((result) => {
                    if (!result.errors.length) {
                        try { copyToUiRoot(); } catch (e) { console.warn(e); }
                    }
                });
            },
        },
    ],
};

async function main() {
    if (watch) {
        const ctx = await esbuild.context(opts);
        await ctx.watch();
        console.log('[build-ui] watching…');
        return;
    }
    await esbuild.build(opts);
    console.log('[build-ui] wrote dist/ui/widgets.js and ui/widgets.js');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
