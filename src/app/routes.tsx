import { createBrowserRouter } from "react-router";

// Pages
import { Splash } from "./pages/Splash";
import { Home } from "./pages/Home";
import { Explore } from "./pages/Explore";
import { ContentDetail } from "./pages/ContentDetail";
import { Quiz } from "./pages/Quiz";
import { Forum } from "./pages/Forum";
import { Profile } from "./pages/Profile";
import { Rankings } from "./pages/Rankings";

import { ForumDetail } from "./pages/ForumDetail";

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminContent } from "./pages/admin/AdminContent";
import { AdminUsers } from "./pages/admin/AdminUsers";

// Layouts
import { UserLayout } from "./layouts/UserLayout";
import { AdminLayout } from "./layouts/AdminLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Splash,
  },
  {
    path: "/app",
    Component: UserLayout,
    children: [
      { index: true, Component: Home },
      { path: "explore", Component: Explore },
      { path: "explore/:id", Component: ContentDetail },
      { path: "quiz", Component: Quiz },
      { path: "rankings", Component: Rankings },
      { path: "forum", Component: Forum },
      { path: "forum/:id", Component: ForumDetail },
      { path: "comments", Component: ForumDetail },
      { path: "profile", Component: Profile },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "content", Component: AdminContent },
      { path: "users", Component: AdminUsers },
    ],
  },
]);
