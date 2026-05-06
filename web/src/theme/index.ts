import { MantineThemeOverride } from "@mantine/core";

export const customTheme: MantineThemeOverride = {
	colorScheme: "dark",
	fontFamily: "Montserrat",
	fontSizes: {
		xs: 12,
		sm: 14,
		md: 16,
		lg: 20,
		xl: 24,
	},
	components: {
		Tooltip: {
			defaultProps: {
				transition: "pop",
			},
		},
		Badge: {
			defaultProps: {
				variant: "light",
			},
			styles: {
				root: {
					textTransform: "uppercase" as const,
				},
			},
		},
		Button: {
			styles: {
				root: {
					textTransform: "uppercase" as const,
					minHeight: "clamp(24px, 1.35vw, 32px)",
					paddingLeft: "clamp(10px, 0.7vw, 15px)",
					paddingRight: "clamp(10px, 0.7vw, 15px)",
					fontSize: "clamp(11px, 0.55vw, 13px)",
				},
			},
		},
		ActionIcon: {
			styles: {
				root: {
					width: "clamp(20px, 1.2vw, 30px)",
					height: "clamp(20px, 1.2vw, 30px)",
					minWidth: "clamp(20px, 1.2vw, 30px)",
				},
			},
		},
		Modal: {
			defaultProps: {
				withinPortal: false,
			},
			styles: (theme: any) => ({
				root: {
					position: "absolute" as const,
					overflow: "visible" as const,
				},
				overlay: {
					position: "absolute" as const,
					borderRadius: theme.radius.sm,
				},
				inner: {
					position: "absolute" as const,
					padding: "clamp(10px, 1.1vw, 22px)",
					overflow: "visible" as const,
				},
				modal: {
					width: "min(100%, clamp(360px, 34vw, 540px))",
					maxWidth: "calc(100vw - 32px)",
					overflow: "visible" as const,
				},
				body: {
					maxHeight: "calc(100dvh - 120px)",
					overflowY: "auto" as const,
					overflowX: "visible" as const,
					paddingTop: 6,
				},
				content: {
					maxHeight: "calc(100dvh - 80px)",
					overflow: "visible" as const,
				},
			}),
		},
		Slider: {
			styles: {
				root: {
					overflow: "visible" as const,
				},
				track: {
					height: "clamp(4px, 0.25vw, 6px)",
				},
				thumb: {
					width: "clamp(12px, 0.7vw, 16px)",
					height: "clamp(12px, 0.7vw, 16px)",
				},
				label: {
					maxWidth: "none",
					whiteSpace: "nowrap" as const,
					zIndex: 40,
				},
			},
		},
		NumberInput: {
			styles: {
				input: {
					minWidth: 0,
					minHeight: "clamp(24px, 1.35vw, 32px)",
					fontSize: "clamp(11px, 0.55vw, 13px)",
				},
			},
		},
		Input: {
			styles: {
				input: {
					minHeight: "clamp(24px, 1.35vw, 32px)",
					fontSize: "clamp(11px, 0.55vw, 13px)",
				},
			},
		},
		Tabs: {
			styles: (theme: any) => ({
				tab: {
					"&[data-active]": {
						borderColor: theme.colors[theme.primaryColor][6],
					},
				},
			}),
		},
	},
};
