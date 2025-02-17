import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Routes, Route, BrowserRouter } from "react-router";
import './index.css'

import Wrapper from "./components/wrapper";
import DeviceGrid from './components/device-grid';
import NewDevice from "./components/new-device";
import Home from './components/home';
import { TranslationsProvider } from './translations/TranslationsProvider';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TranslationsProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Wrapper />} path="/">
            <Route path="dashboard" element={<DeviceGrid />} />
            <Route path="new" element={<NewDevice />} />
            <Route index element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TranslationsProvider>
  </StrictMode>,
);

/*
<Routes>
  <Route index element={<Home />} />
  <Route path="about" element={<About />} />

  <Route element={<AuthLayout />}>
    <Route path="login" element={<Login />} />
    <Route path="register" element={<Register />} />
  </Route>

  <Route path="concerts">
    <Route index element={<ConcertsHome />} />
    <Route path=":city" element={<City />} />
    <Route path="trending" element={<Trending />} />
  </Route>
</Routes>

<Routes>
  <Route path="dashboard" element={<Dashboard />}>
    <Route index element={<Home />} />
    <Route path="settings" element={<Settings />} />
  </Route>
</Routes>
*/