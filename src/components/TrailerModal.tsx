import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Easing,
    Modal,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { WebView } from 'react-native-webview';

import { COLORS, SPACING } from '../utils/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
    visible: boolean;
    videoKey: string | null;
    movieTitle: string;
    onClose: () => void;
    onWebViewFail: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const PLAYER_HEIGHT = Math.round(SCREEN_W * 1.3);

// Animation timings
const OPEN_DURATION = 420;
const CLOSE_DURATION = 300;

// ─── YouTube embed HTML ───────────────────────────────────────────────────────

const buildHTML = (key: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; background:#000; }
    body { display:flex; align-items:center; justify-content:center; height:100vh; overflow:hidden; }
    iframe { width:100vw; height:100vh; border:none; }
  </style>
</head>
<body>
  <iframe
    src="https://www.youtube.com/embed/${key}?autoplay=1&rel=0&modestbranding=1&playsinline=1&controls=1&iv_load_policy=3&color=white"
    allow="autoplay; fullscreen; encrypted-media"
    allowfullscreen
  ></iframe>
</body>
</html>
`;

// ─── Component ────────────────────────────────────────────────────────────────

const TrailerModal = memo(
    ({ visible, videoKey, movieTitle, onClose, onWebViewFail }: Props) => {

        // ── Internal open/close state ─────────────────────────────────────────
        // We keep Modal mounted briefly after visible=false to finish close anim.
        const [mounted, setMounted] = useState(false);
        const [webViewLoading, setWebViewLoading] = useState(true);
        const [webViewError, setWebViewError] = useState(false);

        // ── Animation values ──────────────────────────────────────────────────
        const backdropOpacity = useRef(new Animated.Value(0)).current;
        const sheetY = useRef(new Animated.Value(SCREEN_H)).current;
        const sheetScale = useRef(new Animated.Value(0.96)).current;

        // ── Open animation ────────────────────────────────────────────────────
        const animateOpen = useCallback(() => {
            Animated.parallel([
                // Backdrop fades in
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: OPEN_DURATION,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                // Sheet slides up with spring
                Animated.spring(sheetY, {
                    toValue: 0,
                    tension: 55,
                    friction: 12,
                    useNativeDriver: true,
                }),
                // Sheet scales to 1 from 0.96
                Animated.spring(sheetScale, {
                    toValue: 1,
                    tension: 55,
                    friction: 12,
                    useNativeDriver: true,
                }),
            ]).start();
        }, [backdropOpacity, sheetY, sheetScale]);

        // ── Close animation ───────────────────────────────────────────────────
        const animateClose = useCallback((onDone?: () => void) => {
            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: CLOSE_DURATION,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(sheetY, {
                    toValue: SCREEN_H,
                    duration: CLOSE_DURATION,
                    easing: Easing.in(Easing.back(1.2)),
                    useNativeDriver: true,
                }),
                Animated.timing(sheetScale, {
                    toValue: 0.94,
                    duration: CLOSE_DURATION,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start(() => {
                onDone?.();
            });
        }, [backdropOpacity, sheetY, sheetScale]);

        // ── Watch visibility changes ──────────────────────────────────────────
        useEffect(() => {
            if (visible) {
                // Reset state for new open
                setWebViewLoading(true);
                setWebViewError(false);

                // Reset animation to start position before mounting
                sheetY.setValue(SCREEN_H);
                sheetScale.setValue(0.96);
                backdropOpacity.setValue(0);

                setMounted(true);
                // Small timeout to ensure layout before animating
                const t = setTimeout(() => animateOpen(), 20);
                return () => clearTimeout(t);
            } else if (mounted) {
                // Animate out, then unmount
                animateClose(() => setMounted(false));
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [visible]);

        // ── Close handler (called by ✕ button and backdrop tap) ──────────────
        const handleClose = useCallback(() => {
            animateClose(() => {
                setMounted(false);
                onClose();
            });
        }, [animateClose, onClose]);

        // ── WebView callbacks ─────────────────────────────────────────────────
        const handleLoad = useCallback(() => setWebViewLoading(false), []);

        const handleError = useCallback(() => {
            setWebViewError(true);
            setWebViewLoading(false);
            // Wait a moment to show error state, then fall back
            const t = setTimeout(() => {
                animateClose(() => {
                    setMounted(false);
                    onWebViewFail();
                });
            }, 900);
            return () => clearTimeout(t);
        }, [animateClose, onWebViewFail]);

        if (!mounted || !videoKey) { return null; }

        return (
            <Modal
                visible={mounted}
                transparent
                animationType="none"
                statusBarTranslucent
                onRequestClose={handleClose}
            >
                <StatusBar
                    backgroundColor="transparent"
                    barStyle="light-content"
                    translucent
                />

                {/* ── Dimmed backdrop — tap to dismiss ──────────────── */}
                <TouchableWithoutFeedback onPress={handleClose}>
                    <Animated.View
                        style={[styles.backdrop, { opacity: backdropOpacity }]}
                    />
                </TouchableWithoutFeedback>

                {/* ── Animated bottom sheet ──────────────────────────── */}
                <Animated.View
                    style={[
                        styles.sheet,
                        {
                            transform: [
                                { translateY: sheetY },
                                { scale: sheetScale },
                            ],
                        },
                    ]}
                >
                    {/* Drag handle */}
                    <View style={styles.dragHandleBar} />

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.headerEyebrow}>🎬  TRAILER</Text>
                            <Text numberOfLines={1} style={styles.headerTitle}>
                                {movieTitle}
                            </Text>
                        </View>

                        {/* Close button */}
                        <TouchableOpacity
                            activeOpacity={0.75}
                            onPress={handleClose}
                            style={styles.closeBtn}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            accessibilityRole="button"
                            accessibilityLabel="Close trailer"
                        >
                            <Text style={styles.closeBtnText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* ── Player area ──────────────────────────────────── */}
                    <View style={styles.playerOuter}>

                        {/* YouTube WebView */}
                        {!webViewError && (
                            <WebView
                                source={{ html: buildHTML(videoKey) }}
                                style={styles.webView}
                                allowsInlineMediaPlayback
                                mediaPlaybackRequiresUserAction={false}
                                allowsFullscreenVideo
                                javaScriptEnabled
                                domStorageEnabled
                                onLoad={handleLoad}
                                onError={handleError}
                                onHttpError={handleError}
                                androidHardwareAccelerationDisabled={false}
                                onShouldStartLoadWithRequest={req =>
                                    req.url.includes('youtube.com') ||
                                    req.url.includes('about:') ||
                                    req.url === 'about:srcdoc'
                                }
                            />
                        )}

                        {/* Loading overlay */}
                        {webViewLoading && !webViewError && (
                            <Animated.View
                                style={[
                                    styles.overlay,
                                    { opacity: backdropOpacity },
                                ]}
                            >
                                <ActivityIndicator size="large" color={COLORS.primary} />
                                <Text style={styles.loadingText}>Loading trailer…</Text>
                            </Animated.View>
                        )}

                        {/* Error state */}
                        {webViewError && (
                            <View style={styles.overlay}>
                                <Text style={styles.errorIcon}>⚠️</Text>
                                <Text style={styles.errorTitle}>
                                    Couldn't load player
                                </Text>
                                <Text style={styles.errorSub}>
                                    Opening YouTube instead…
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Bottom safe pad */}
                    <View style={styles.bottomPad} />
                </Animated.View>
            </Modal>
        );
    },
);

TrailerModal.displayName = 'TrailerModal';
export default TrailerModal;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

    // ── Backdrop ──────────────────────────────────────────────────────────────
    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0,0,0,0.82)',
    },

    // ── Sheet ─────────────────────────────────────────────────────────────────
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0D1117',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
        // Top shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.55,
        shadowRadius: 20,
        elevation: 24,
    },

    // ── Drag handle ───────────────────────────────────────────────────────────
    dragHandleBar: {
        alignSelf: 'center',
        width: 44,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.22)',
        marginTop: SPACING.md,
        marginBottom: SPACING.xs,
    },

    // ── Header ────────────────────────────────────────────────────────────────
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.base,
        paddingVertical: SPACING.md,
    },

    headerLeft: {
        flex: 1,
        marginRight: SPACING.md,
    },

    headerEyebrow: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.primary,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 3,
    },

    headerTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.3,
    },

    // ── Close button ──────────────────────────────────────────────────────────
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.14)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    closeBtnText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },

    // ── Player ────────────────────────────────────────────────────────────────
    playerOuter: {
        width: SCREEN_W,
        height: PLAYER_HEIGHT,
        backgroundColor: '#000',
        position: 'relative',
    },

    webView: {
        width: SCREEN_W,
        height: PLAYER_HEIGHT,
        backgroundColor: '#000',
    },

    // ── Overlays ──────────────────────────────────────────────────────────────
    overlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: '#0D1117',
        justifyContent: 'center',
        alignItems: 'center',
        gap: SPACING.md,
    },

    loadingText: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 14,
        fontWeight: '600',
        marginTop: SPACING.sm,
    },

    errorIcon: {
        fontSize: 38,
    },

    errorTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },

    errorSub: {
        color: 'rgba(255,255,255,0.45)',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 4,
    },

    // ── Bottom pad ────────────────────────────────────────────────────────────
    bottomPad: {
        height: Platform.OS === 'ios' ? 30 : 18,
        backgroundColor: '#0D1117',
    },
});
