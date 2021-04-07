module.exports = ({env}) => ({
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
        cssnano: env === "production" ? {preset: "default", discardComments: {removeAll: true}} : false
    }
})