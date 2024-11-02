import { lazy } from "solid-js";
import type { RouteDefinition } from "@solidjs/router";

import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import DashboardPage from "./pages/Dashboard";
import Amchart1 from "./pages/amchart1";
import Amchart2 from "./pages/amchart2";
import Amchart3 from "./pages/amchart3";
import Sidebar from "./pages/Sidebar";
import Navbar from "./pages/navbar";
import EditData from "./pages/Edit";
import ForgotPass from "./pages/forgotpass";
import otp from "./pages/otp";
import adduser from "./pages/adduser";
import gmap from "./pages/Map";

export const routes: RouteDefinition[] = [
  {
    path: "/",
    component: LoginPage,
  },
  {
    path: "/register",
    component: lazy(() => import("./pages/Register")),
    data: RegisterPage,
  },
  {
    path: "/dashboard",
    component: lazy(() => import("./pages/Dashboard")),
    data: DashboardPage,
  },
  {
    path: "/amchart1",
    component: lazy(() => import("./pages/amchart1")),
    data: Amchart1,
  },
  {
    path: "/amchart2",
    component: lazy(() => import("./pages/amchart2")),
    data: Amchart2,
  },
  {
    path: "/amchart3",
    component: lazy(() => import("./pages/amchart3")),
    data: Amchart3,
  },
  {
    path: "/sidebar",
    component: lazy(() => import("./pages/Sidebar")),
    data: Sidebar,
  },
  {
    path: "/navbar",
    component: lazy(() => import("./pages/navbar")),
    data: Navbar,
  },
  {
    path: "/edit/:id",
    component: lazy(() => import("./pages/Edit")),
    data: EditData,
  },
  {
    path: "/forgotpass",
    component: lazy(() => import("./pages/forgotpass")),
    data: ForgotPass,
  },
  {
    path: "/otp",
    component: lazy(() => import("./pages/otp")),
    data: otp,
  },
  {
    path: "/adduser",
    component: lazy(() => import("./pages/adduser")),
    data: adduser,
  },
];
