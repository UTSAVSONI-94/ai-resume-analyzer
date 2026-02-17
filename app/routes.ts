import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route('/auth', 'routes/auth.tsx'),
    route('/upload', 'routes/upload.tsx'),
    route('/resume/:id', 'routes/resume.tsx'),
    route('/dashboard', 'routes/dashboard.tsx'),
    route('/compare', 'routes/compare.tsx'),
    route('/wipe', 'routes/wipe.tsx'),
    route('/tailor', 'routes/tailor.tsx'),
    route('/cover-letter', 'routes/cover-letter.tsx'),
    route('/interview', 'routes/interview.tsx'),
] satisfies RouteConfig;
