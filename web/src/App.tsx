import React, { useRef, useCallback } from "react";
import { Box, createStyles, Transition } from "@mantine/core";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useNuiEvent } from "./hooks/useNuiEvent";
import { useVisibility } from "./store/visibility";
import { useAppearance } from "./store/appearance";
import { usePresets } from "./store/presets";
import { useOutfits } from "./store/outfits";
import { useConfig, ConfigState } from "./store/config";
import { useLocale } from "./store/locale";
import { useMaxValues } from "./store/maxValues";
import { useCamera } from "./store/camera";
import { useExitListener } from "./hooks/useExitListener";
import { fetchNui } from "./utils/fetchNui";

import Sidebar from "./components/Sidebar";
import ActionBar from "./components/ActionBar";
import Face from "./layouts/face";
import Hair from "./layouts/hair";
import Clothing from "./layouts/clothing";
import Props from "./layouts/props";
import Tattoos from "./layouts/tattoos";
import Colors from "./layouts/colors";
import Presets from "./layouts/presets";
import Outfits from "./layouts/outfits";
import Camera from "./layouts/camera";
import Randomizer from "./layouts/randomizer";
import Animations from "./layouts/animations";
import Ped from "./layouts/ped";
import WalkStyle from "./layouts/walkstyle";
import Accessories from "./layouts/accessories";
import History from "./layouts/history";
import Marketplace from "./layouts/marketplace";
import Drops from "./layouts/drops";
import Wardrobe from "./layouts/wardrobe";

import type { AppearanceData, AppearancePreset } from "./types";
import type { Outfit } from "./types/outfit";

const useStyles = createStyles((theme) => ({
	container: {
		width: "100%",
		height: "100dvh",
		minHeight: "100vh",
		display: "flex",
		alignItems: "stretch",
		padding: 0,
		boxSizing: "border-box" as const,
	},
	main: {
		width: "clamp(390px, 27vw, 640px)",
		maxWidth: "calc(100vw - 24px)",
		minWidth: "min(340px, calc(100vw - 24px))",
		height: "100dvh",
		minHeight: "100vh",
		backgroundColor: theme.colors.dark[8],
		display: "flex",
		overflow: "hidden",
		position: "relative",
		boxShadow: "0 18px 45px rgba(0, 0, 0, 0.32)",
		["@media (min-width: 2200px), (min-height: 1300px)"]: {
			width: "clamp(560px, 25vw, 700px)",
		},
		["@media (max-width: 1366px), (max-height: 760px)"]: {
			width: "clamp(360px, 31vw, 500px)",
		},
		["@media (max-width: 420px)"]: {
			width: "100vw",
			maxWidth: "100vw",
			minWidth: "100vw",
			borderRadius: 0,
		},
	},
	content: {
		flex: 1,
		minWidth: 0,
		overflow: "hidden",
		display: "flex",
		flexDirection: "column",
	},
	viewport: {
		flex: 1,
		height: "100%",
		cursor: "grab",
		"&:active": {
			cursor: "grabbing",
		},
	},
}));

const tabRoutes: Record<string, string> = {
	ped: "/ped",
	face: "/face",
	hair: "/hair",
	clothing: "/clothing",
	props: "/props",
	tattoos: "/tattoos",
	colors: "/colors",
	presets: "/presets",
	outfits: "/outfits",
	camera: "/camera",
	randomizer: "/randomizer",
	animations: "/animations",
	walkstyle: "/walkstyle",
	accessories: "/accessories",
	history: "/history",
	marketplace: "/marketplace",
	drops: "/drops",
	wardrobe: "/wardrobe",
};

const DefaultRedirect: React.FC = () => {
	const allowedTabs = useConfig((s) => s.allowedTabs);
	const firstTab = allowedTabs?.[0];
	const target = firstTab ? (tabRoutes[firstTab] || "/ped") : "/ped";

	return <Navigate to={target} replace />;
};

const App: React.FC = () => {
	const { classes } = useStyles();

	const [visible, setVisible] = useVisibility((state) => [state.visible, state.setVisible]);

	const setOriginal = useAppearance((s) => s.setOriginal);
	const setAppearanceData = useAppearance((s) => s.setAppearance);
	const setPresets = usePresets((s) => s.setPresets);
	const setOutfits = useOutfits((s) => s.setOutfits);
	const setConfig = useConfig((s) => s.setConfig);
	const setAllowedTabs = useConfig((s) => s.setAllowedTabs);
	const setShopType = useConfig((s) => s.setShopType);
	const setPedMenuActive = useConfig((s) => s.setPedMenuActive);
	const setPedAssignment = useConfig((s) => s.setPedAssignment);
	const setLocaleStrings = useLocale((s) => s.setStrings);
	const setLocaleName = useLocale((s) => s.setLocale);
	const setMaxValues = useMaxValues((s) => s.setMaxValues);
	const updateTextureMax = useMaxValues((s) => s.updateTextureMax);
	const setCameraPreset = useCamera((s) => s.setPreset);
	const setCameraLighting = useCamera((s) => s.setLighting);
	const setCameraFov = useCamera((s) => s.setFov);
	const setCameraZoom = useCamera((s) => s.setZoom);
	const setCameraRotation = useCamera((s) => s.setRotation);

	const navigate = useNavigate();

	useNuiEvent("setConfig", (data: Partial<ConfigState> & { localeStrings?: Record<string, string> }) => {
		if (data.localeStrings) {
			setLocaleStrings(data.localeStrings);
			delete data.localeStrings;
		}
		if (data.assignedPed) {
			const assignedPed = data.assignedPed as any;
			const value = assignedPed.value || assignedPed.model;
			data.assignedPed = value ? { value, label: assignedPed.label || value } : null;
		}
		if (data.locale) {
			setLocaleName(data.locale);
		}
		if (data.cameraDefaults) {
			setCameraPreset(data.cameraDefaults.preset);
			setCameraLighting(data.cameraDefaults.lighting);
			setCameraFov(data.cameraDefaults.fov);
			setCameraZoom(data.cameraDefaults.zoom);
			setCameraRotation(data.cameraDefaults.rotation);
		}
		setConfig(data);
	});

	useNuiEvent("setVisible", (data?: { visible: boolean; route?: string }) => {
		if (data?.visible !== undefined) setVisible(data.visible);
		if (!data?.visible) {
			setAllowedTabs(null);
			setPedMenuActive(false);
		}
		if (data?.route) navigate(data.route);
	});

	useNuiEvent("setAppearance", (data: AppearanceData) => {
		setOriginal(data);
	});

	useNuiEvent("updateModelAppearance", (data: AppearanceData) => {
		setAppearanceData(data);
	});

	useNuiEvent("setPresets", (data: AppearancePreset[]) => {
		setPresets(data);
	});

	useNuiEvent("setOutfits", (data: Outfit[]) => {
		setOutfits(data);
	});

	useNuiEvent("setMaxValues", (data: any) => {
		setMaxValues(data);
	});

	useNuiEvent("updateTextureMax", (data: { type: "component" | "prop"; id: number; maxTexture: number }) => {
		updateTextureMax(data.type, data.id, data.maxTexture);
	});

	useNuiEvent("setShopType", (data: { shopType: string | null }) => {
		setShopType(data.shopType ?? null);
	});

	useNuiEvent("setPedMenuActive", (data?: { active?: boolean }) => {
		setPedMenuActive(data?.active === true);
	});

	useNuiEvent("setPedAssignment", (data?: { value?: string; model?: string; label?: string }) => {
		const value = data?.value || data?.model;
		setPedAssignment(value ? { value, label: data?.label || value } : null);
	});

	useNuiEvent("setAllowedTabs", (data: { tabs: string[] }) => {
		setAllowedTabs(data.tabs);

		if (data.tabs && data.tabs.length > 0) {
			navigate(tabRoutes[data.tabs[0]] || "/ped");
		}
	});

	useExitListener(setVisible, () => { });

	return (
		<Box className={classes.container}>
			<Transition transition="slide-right" mounted={visible}>
				{(style) => (
					<Box className={classes.main} style={style} id="appearance-panel">
						<Sidebar />
						<Box className={classes.content}>
							<Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
								<Routes>
									<Route path="/ped" element={<Ped />} />
									<Route path="/face" element={<Face />} />
									<Route path="/hair" element={<Hair />} />
									<Route path="/clothing" element={<Clothing />} />
									<Route path="/props" element={<Props />} />
									<Route path="/tattoos" element={<Tattoos />} />
									<Route path="/colors" element={<Colors />} />
									<Route path="/presets" element={<Presets />} />
									<Route path="/outfits" element={<Outfits />} />
									<Route path="/camera" element={<Camera />} />
									<Route path="/randomizer" element={<Randomizer />} />
									<Route path="/animations" element={<Animations />} />
									<Route path="/walkstyle" element={<WalkStyle />} />
									<Route path="/accessories" element={<Accessories />} />
									<Route path="/history" element={<History />} />
									<Route path="/marketplace" element={<Marketplace />} />
									<Route path="/drops" element={<Drops />} />
									<Route path="/wardrobe" element={<Wardrobe />} />
									<Route path="/" element={<DefaultRedirect />} />
								</Routes>
							</Box>

							<ActionBar
								onSavePreset={() => navigate("/presets")}
								onSaveOutfit={() => navigate("/outfits")}
							/>
						</Box>
					</Box>
				)}
			</Transition>
		</Box>
	);
};

export default App;
