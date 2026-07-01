import { createBrowserRouter, Navigate } from "react-router";

// Pages
import { Home } from "./pages/Home";
import { Explore } from "./pages/Explore";
import { ContentDetail } from "./pages/ContentDetail";
import { Quiz } from "./pages/Quiz";
import { Forum } from "./pages/Forum";
import { Profile } from "./pages/Profile";
import { Rankings } from "./pages/Rankings";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ChangePassword } from "./pages/ChangePassword";

import { ForumDetail } from "./pages/ForumDetail";
import { CompletedStudies } from "./pages/CompletedStudies";
import { SavedDebates } from "./pages/SavedDebates";
import { WriterContent } from "./pages/WriterContent";
import { MyContent } from "./pages/MyContent";

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminContent } from "./pages/admin/AdminContent";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminQuiz } from "./pages/admin/AdminQuiz";
import { AdminTrivia } from "./pages/admin/AdminTrivia";
import { AdminReview } from "./pages/admin/AdminReview";
import { AdminCategories } from "./pages/admin/AdminCategories";
import { AdminPasswordResets } from "./pages/admin/AdminPasswordResets";

// Layouts
import { UserLayout } from "./layouts/UserLayout";
import { AdminLayout } from "./layouts/AdminLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: () => <Navigate to="/app" replace />,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
  {
    path: "/change-password",
    Component: ChangePassword,
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
      { path: "completed", Component: CompletedStudies },
      { path: "saved", Component: SavedDebates },
      { path: "create", Component: WriterContent },
      { path: "my-content", Component: MyContent },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "content", Component: AdminContent },
      { path: "review", Component: AdminReview },
      { path: "users", Component: AdminUsers },
      { path: "quiz", Component: AdminQuiz },
      { path: "trivia", Component: AdminTrivia },
      { path: "categories", Component: AdminCategories },
      { path: "password-resets", Component: AdminPasswordResets },
    ],
  },
]);
