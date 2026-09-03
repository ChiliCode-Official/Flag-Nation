import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

interface NewsItem {
    badge: string
    title: string
    description: string
    date?: string
    image?: any
    link?: string
}

interface FontStyleValue {
    fontSize?: string | number
    letterSpacing?: string | number
    lineHeight?: string | number
    fontWeight?: number | string
    fontStyle?: React.CSSProperties["fontStyle"]
    textAlign?: React.CSSProperties["textAlign"]
    fontFamily?: string
}

interface CarruselEditorialProps {
    items: NewsItem[]
    accentColor: string
    backgroundColor: string
    cardBackground: string
    listCardBackground: string
    textColor: string
    mutedTextColor: string
    borderColor: string
    fontBadge?: FontStyleValue
    fontTitle?: FontStyleValue
    fontDescription?: FontStyleValue
    autoplay: boolean
    intervalSeconds: number
    imageFit: "contain" | "cover"
    height: number
    style?: React.CSSProperties
}

function resolveImageSrc(img: any): string {
    if (!img) return ""
    if (typeof img === "string") {
        const trimmed = img.trim()
        if (trimmed.match(/imgur\.com\/([a-zA-Z0-9]+)$/)) {
            const id = trimmed.split("/").pop()
            return `https://i.imgur.com/${id}.jpeg`
        }
        return trimmed
    }
    if (typeof img === "object") {
        const src = img.src || img.url || ""
        if (typeof src === "string") {
            const trimmed = src.trim()
            if (trimmed.match(/imgur\.com\/([a-zA-Z0-9]+)$/)) {
                const id = trimmed.split("/").pop()
                return `https://i.imgur.com/${id}.jpeg`
            }
            return trimmed
        }
    }
    return ""
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function CarruselEditorialFlagNation(props: CarruselEditorialProps) {
    const {
        items = [],
        accentColor = "#FF6B00",
        backgroundColor = "#0A0B0C",
        cardBackground = "#141414",
        listCardBackground = "#181818",
        textColor = "#FFFFFF",
        mutedTextColor = "rgba(255,255,255,0.65)",
        borderColor = "rgba(255,255,255,0.12)",
        fontBadge = {},
        fontTitle = {},
        fontDescription = {},
        autoplay = true,
        intervalSeconds = 6,
        imageFit = "contain",
        height = 460,
        style = {},
    } = props

    const [currentIndex, setCurrentIndex] = React.useState(0)
    const count = items.length

    React.useEffect(() => {
        if (!autoplay || count <= 1) return
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % count)
        }, Math.max(2, intervalSeconds) * 1000)
        return () => clearInterval(timer)
    }, [autoplay, intervalSeconds, count])

    const activeItem = items[currentIndex] || items[0]

    const prevSlide = () => {
        if (count <= 1) return
        setCurrentIndex((prev) => (prev - 1 + count) % count)
    }

    const nextSlide = () => {
        if (count <= 1) return
        setCurrentIndex((prev) => (prev + 1) % count)
    }

    if (count === 0) {
        return (
            <div style={{ padding: 24, textAlign: "center", color: mutedTextColor, ...style }}>
                No hay artículos editoriales configurados.
            </div>
        )
    }

    const imageSrc = resolveImageSrc(activeItem?.image)

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                maxWidth: 1200,
                margin: "0 auto",
                background: backgroundColor,
                color: textColor,
                boxSizing: "border-box",
                padding: "16px",
                display: "grid",
                gridTemplateColumns: "1.45fr 1fr",
                gap: "20px",
                alignItems: "stretch",
                ...style,
            }}
        >
            {/* PANEL PRINCIPAL DESTACADO */}
            <div
                style={{
                    position: "relative",
                    minHeight: height,
                    background: cardBackground,
                    border: `1px solid ${borderColor}`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "24px",
                    boxSizing: "border-box",
                    overflow: "hidden",
                }}
            >
                {/* Imagen centrada */}
                {imageSrc ? (
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: imageFit === "contain" ? "20px" : "0",
                            zIndex: 1,
                            overflow: "hidden",
                        }}
                    >
                        <img
                            src={imageSrc}
                            alt={activeItem.title || "Editorial Flag Nation"}
                            referrerPolicy="no-referrer"
                            style={{
                                maxWidth: "100%",
                                maxHeight: "100%",
                                width: imageFit === "cover" ? "100%" : "auto",
                                height: imageFit === "cover" ? "100%" : "auto",
                                objectFit: imageFit,
                                objectPosition: "center",
                                opacity: imageFit === "contain" ? 0.95 : 0.45,
                                transition: "all 0.4s ease-in-out",
                            }}
                        />
                    </div>
                ) : null}

                {/* Filtro degradado inferior para legibilidad */}
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: "75%",
                        background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)",
                        zIndex: 2,
                        pointerEvents: "none",
                    }}
                />

                {/* Barra superior: Controles prev/next y Badge */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                    }}
                >
                    <div style={{ display: "flex", gap: "6px" }}>
                        <button
                            type="button"
                            onClick={prevSlide}
                            aria-label="Anterior"
                            style={{
                                width: 34,
                                height: 34,
                                background: accentColor,
                                border: "none",
                                color: "#000000",
                                fontWeight: "bold",
                                fontSize: 18,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            ‹
                        </button>
                        <button
                            type="button"
                            onClick={nextSlide}
                            aria-label="Siguiente"
                            style={{
                                width: 34,
                                height: 34,
                                background: accentColor,
                                border: "none",
                                color: "#000000",
                                fontWeight: "bold",
                                fontSize: 18,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            ›
                        </button>
                    </div>

                    {activeItem.badge && (
                        <span
                            style={{
                                border: `1px solid ${accentColor}`,
                                color: accentColor,
                                background: "rgba(0,0,0,0.7)",
                                padding: "4px 10px",
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                fontWeight: 700,
                                fontSize: 11,
                                ...fontBadge,
                            }}
                        >
                            {activeItem.badge}
                        </span>
                    )}
                </div>

                {/* Textos Principales */}
                <div
                    style={{
                        position: "relative",
                        zIndex: 3,
                        marginTop: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                    }}
                >
                    {activeItem.title && (
                        <h2
                            style={{
                                margin: 0,
                                fontSize: 26,
                                fontWeight: 900,
                                textTransform: "uppercase",
                                lineHeight: 1.15,
                                color: textColor,
                                textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                                ...fontTitle,
                            }}
                        >
                            {activeItem.title}
                        </h2>
                    )}
                    {activeItem.description && (
                        <p
                            style={{
                                margin: 0,
                                fontSize: 14,
                                lineHeight: 1.4,
                                color: mutedTextColor,
                                ...fontDescription,
                            }}
                        >
                            {activeItem.description}
                        </p>
                    )}
                    {activeItem.link && (
                        <div>
                            <a
                                href={activeItem.link}
                                style={{
                                    display: "inline-block",
                                    marginTop: 4,
                                    color: accentColor,
                                    textTransform: "uppercase",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    letterSpacing: "0.05em",
                                    textDecoration: "none",
                                    borderBottom: `1px solid ${accentColor}`,
                                    paddingBottom: 2,
                                }}
                            >
                                Leer más →
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* LISTA LATERAL DERECHA */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    justifyContent: "flex-start",
                }}
            >
                {items.map((item, index) => {
                    const isActive = index === currentIndex
                    const thumb = resolveImageSrc(item.image)

                    return (
                        <div
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "12px",
                                background: isActive ? listCardBackground : "rgba(255,255,255,0.03)",
                                border: `1px solid ${isActive ? accentColor : borderColor}`,
                                borderLeft: `4px solid ${isActive ? accentColor : "transparent"}`,
                                cursor: "pointer",
                                transition: "all 0.25s ease",
                                boxSizing: "border-box",
                            }}
                        >
                            {/* Miniatura cuadrada */}
                            <div
                                style={{
                                    width: 54,
                                    height: 54,
                                    background: "#111111",
                                    flexShrink: 0,
                                    overflow: "hidden",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: `1px solid ${borderColor}`,
                                }}
                            >
                                {thumb ? (
                                    <img
                                        src={thumb}
                                        alt=""
                                        referrerPolicy="no-referrer"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                ) : (
                                    <span style={{ fontSize: 10, color: mutedTextColor }}>Sin img</span>
                                )}
                            </div>

                            {/* Textos del elemento */}
                            <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                                <span
                                    style={{
                                        fontSize: 10,
                                        color: accentColor,
                                        textTransform: "uppercase",
                                        fontWeight: 800,
                                        letterSpacing: "0.04em",
                                    }}
                                >
                                    {item.badge || "EDITORIAL"}
                                </span>
                                <span
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 700,
                                        color: textColor,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    {item.title || "Artículo sin título"}
                                </span>
                                {item.description && (
                                    <span
                                        style={{
                                            fontSize: 11,
                                            color: mutedTextColor,
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {item.description}
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

CarruselEditorialFlagNation.displayName = "CarruselEditorialFlagNation"

addPropertyControls(CarruselEditorialFlagNation, {
    items: {
        type: ControlType.Array,
        title: "Artículos",
        control: {
            type: ControlType.Object,
            controls: {
                badge: {
                    type: ControlType.String,
                    title: "Etiqueta",
                    defaultValue: "FLAG NATION",
                },
                title: {
                    type: ControlType.String,
                    title: "Título",
                    defaultValue: "LISTOS LOS CAMPOS PARA EL FIN DE SEMANA",
                },
                description: {
                    type: ControlType.String,
                    title: "Descripción",
                    defaultValue: "Revisa los campos asignados y las horas oficiales de la jornada.",
                },
                image: {
                    type: ControlType.ResponsiveImage,
                    title: "Imagen",
                },
                link: {
                    type: ControlType.Link,
                    title: "Enlace",
                    defaultValue: "",
                },
            },
        },
        defaultValue: [
            {
                badge: "FLAG NATION",
                title: "LISTOS LOS CAMPOS PARA EL FIN DE SEMANA",
                description: "Revisa los campos asignados y las horas oficiales de la jornada.",
                image: {
                    src: "https://i.imgur.com/GQ7tTVJ.jpeg",
                    alt: "Flag Nation Slide 1",
                },
                link: "",
            },
            {
                badge: "CALENDARIO",
                title: "ROL DE JUEGOS Y CRONOGRAMA OFICIAL",
                description: "Actualización semanal de los enfrentamientos y estadísticas.",
                image: {
                    src: "https://i.imgur.com/xpOsgF7.jpeg",
                    alt: "Flag Nation Slide 2",
                },
                link: "",
            },
        ],
    },
    imageFit: {
        type: ControlType.Enum,
        title: "Ajuste Imagen",
        options: ["contain", "cover"],
        optionTitles: ["Centrada Completa (Contain)", "Cubrir Panel (Cover)"],
        defaultValue: "contain",
    },
    height: {
        type: ControlType.Number,
        title: "Altura Panel",
        defaultValue: 460,
        min: 300,
        max: 800,
        step: 10,
        unit: "px",
    },
    accentColor: {
        type: ControlType.Color,
        title: "Color Acento",
        defaultValue: "#FF6B00",
    },
    backgroundColor: {
        type: ControlType.Color,
        title: "Fondo General",
        defaultValue: "#0A0B0C",
    },
    cardBackground: {
        type: ControlType.Color,
        title: "Fondo Destacado",
        defaultValue: "#141414",
    },
    listCardBackground: {
        type: ControlType.Color,
        title: "Fondo Lista Activa",
        defaultValue: "#181818",
    },
    textColor: {
        type: ControlType.Color,
        title: "Color Texto",
        defaultValue: "#FFFFFF",
    },
    mutedTextColor: {
        type: ControlType.Color,
        title: "Texto Tenue",
        defaultValue: "rgba(255,255,255,0.65)",
    },
    borderColor: {
        type: ControlType.Color,
        title: "Bordes",
        defaultValue: "rgba(255,255,255,0.12)",
    },
    fontBadge: {
        type: ControlType.Font,
        title: "Fuente Etiqueta",
        controls: "extended",
    },
    fontTitle: {
        type: ControlType.Font,
        title: "Fuente Título",
        controls: "extended",
    },
    fontDescription: {
        type: ControlType.Font,
        title: "Fuente Descripción",
        controls: "extended",
    },
    autoplay: {
        type: ControlType.Boolean,
        title: "Autoplay",
        defaultValue: true,
    },
    intervalSeconds: {
        type: ControlType.Number,
        title: "Segundos Rotación",
        defaultValue: 6,
        min: 2,
        max: 30,
        step: 1,
    },
})

export { CarruselEditorialFlagNation as Carrusel_Editorial_kraQen, CarruselEditorialFlagNation as CarruselEditorial }
