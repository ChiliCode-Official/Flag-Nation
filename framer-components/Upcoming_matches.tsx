import * as React from "react"
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"

interface MatchItem {
    date: string
    time: string
    competencia: string
    opponent: string
    logo?: { src?: string; srcSet?: string; alt?: string }
    logoRival?: { src?: string; srcSet?: string; alt?: string }
    carrerasLocal?: number
    carrerasVisitante?: number
    detalleFinal?: string
    condition: "local" | "visitante" | "finalizado" | "en_curso"
    link: string
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

interface MyComponentProps {
    partidos: MatchItem[]
    fondo: string
    superficie: string
    acento: string
    texto: string
    textoAtenuado: string
    lineas: string
    sombraCard?: any
    fuenteEtiqueta?: FontStyleValue
    fuenteContador?: FontStyleValue
    fuenteCompetencia?: FontStyleValue
    fuentePrincipal?: FontStyleValue
    fuenteSecundaria?: FontStyleValue
    tamanoEscudo?: number
    anchoFranja?: number
    altoTarjeta?: number
    gapFilas?: number
    escalaEspaciado?: number
    tamanoIconoNav?: number
    iconoFranja?: { src?: string; srcSet?: string; alt?: string }
    escudoPropio?: { src?: string; srcSet?: string; alt?: string }
    etiquetaProximo?: string
    etiquetaBadge?: string
    etiquetaDias?: string
    etiquetaHoras?: string
    etiquetaMin?: string
    etiquetaSeg?: string
    textoBoton?: string
    sufijoHora?: string
    etiquetaFinalizado?: string
    etiquetaEnCurso?: string
    textoVacio?: string
    enlaceBoton?: string
    mostrarContador?: boolean
    mostrarBoton?: boolean
    mostrarControles?: boolean
    style?: React.CSSProperties
}

const WEEKDAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

function parseTimeParts(raw: string): { hours: number; minutes: number } {
    const match = (raw || "").match(/^(\d{1,2}):(\d{2})/)
    if (!match) return { hours: 0, minutes: 0 }
    const hours = Math.max(0, Math.min(23, Number(match[1])))
    const minutes = Math.max(0, Math.min(59, Number(match[2])))
    return { hours, minutes }
}

function getMatchDateTime(item: MatchItem): Date | null {
    if (!item || !item.date) return null
    const base = new Date(item.date)
    if (Number.isNaN(base.getTime())) return null
    const { hours, minutes } = parseTimeParts(item.time || "00:00")
    const merged = new Date(base)
    merged.setHours(hours, minutes, 0, 0)
    return merged
}

function pad2(value: number): string {
    return `${Math.max(0, Math.floor(value))}`.padStart(2, "0")
}

function formatDateLine(date: Date): string {
    const weekday = WEEKDAYS_ES[date.getDay()] || "Dom"
    const day = pad2(date.getDate())
    const month = pad2(date.getMonth() + 1)
    const year = date.getFullYear()
    return `${weekday} ${day}/${month}/${year}`
}

function normalizeFinishDetail(value?: string): string {
    const safeValue = (value || "").trim()
    const juegoMatch = safeValue.match(/^juego\s+(\d+)$/i)
    if (juegoMatch) return `Juego ${juegoMatch[1]}`
    return safeValue
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function UpcomingGames(props: MyComponentProps) {
    const {
        partidos = [],
        fondo = "#000000",
        superficie = "#121212",
        acento = "#FF6B00",
        texto = "#FFFFFF",
        textoAtenuado = "rgba(255,255,255,0.5)",
        lineas = "rgba(255,255,255,0.15)",
        sombraCard = "none",
        fuenteEtiqueta = {},
        fuenteContador = {},
        fuenteCompetencia = {},
        fuentePrincipal = {},
        fuenteSecundaria = {},
        tamanoEscudo = 40,
        anchoFranja = 56,
        altoTarjeta = 116,
        gapFilas = 16,
        escalaEspaciado = 1,
        tamanoIconoNav = 14,
        iconoFranja,
        escudoPropio,
        etiquetaProximo = "Próximo Encuentro",
        etiquetaBadge = "Siguiente",
        etiquetaDias = "Días",
        etiquetaHoras = "Hrs",
        etiquetaMin = "Min",
        etiquetaSeg = "Seg",
        textoBoton = "Ver Calendario",
        sufijoHora = "GMT-6",
        etiquetaFinalizado = "Finalizado",
        etiquetaEnCurso = "EN VIVO",
        textoVacio = "No hay partidos programados",
        enlaceBoton = "calendar.html",
        mostrarContador = true,
        mostrarBoton = true,
        mostrarControles = true,
        style = {},
    } = props

    const isStaticRenderer = useIsStaticRenderer()
    const hasExternalWidth = style.width !== undefined
    const hasExternalHeight = style.height !== undefined

    const safeEscalaEspaciado = Number.isFinite(escalaEspaciado)
        ? Math.max(0.7, Number(escalaEspaciado))
        : 1
    const safeTamanoEscudo = Number.isFinite(tamanoEscudo)
        ? Math.max(20, Number(tamanoEscudo))
        : 40
    const safeAnchoFranja = Number.isFinite(anchoFranja)
        ? Math.max(40, Number(anchoFranja))
        : 56
    const safeAltoTarjeta = Number.isFinite(altoTarjeta)
        ? Math.max(86, Number(altoTarjeta))
        : 116
    const safeGapFilas = Number.isFinite(gapFilas)
        ? Math.max(0, Number(gapFilas))
        : 16
    const safeTamanoIconoNav = Number.isFinite(tamanoIconoNav)
        ? Math.max(10, Number(tamanoIconoNav))
        : 14

    const rootRef = React.useRef<HTMLDivElement | null>(null)
    const [containerWidth, setContainerWidth] = React.useState<number>(() =>
        typeof style.width === "number" ? style.width : 1200
    )
    const [currentPage, setCurrentPage] = React.useState(0)
    const [nowMs, setNowMs] = React.useState(() => Date.now())

    React.useEffect(() => {
        if (typeof window === "undefined" || !rootRef.current) return
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0]
            if (!entry) return
            setContainerWidth(entry.contentRect.width)
        })
        observer.observe(rootRef.current)
        return () => observer.disconnect()
    }, [])

    const sortedMatches = React.useMemo(() => {
        return (partidos || [])
            .map((match) => ({ match, dateTime: getMatchDateTime(match) }))
            .filter((item): item is { match: MatchItem; dateTime: Date } =>
                Boolean(item.dateTime)
            )
            .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
    }, [partidos])

    const nextMatchIndex = React.useMemo(() => {
        return sortedMatches.findIndex(
            (item) =>
                item.match.condition !== "finalizado" &&
                item.dateTime.getTime() > nowMs
        )
    }, [sortedMatches, nowMs])

    const selectedMatchIndex = React.useMemo(() => {
        if (sortedMatches.length === 0) return -1
        if (nextMatchIndex >= 0) return nextMatchIndex
        return sortedMatches.length - 1
    }, [sortedMatches, nextMatchIndex])

    const selectedMatchItem =
        selectedMatchIndex >= 0 ? sortedMatches[selectedMatchIndex] : null
    const hasActiveCountdown = Boolean(nextMatchIndex >= 0 && selectedMatchItem)

    React.useEffect(() => {
        if (isStaticRenderer || !hasActiveCountdown) return
        const timer = window.setInterval(() => {
            setNowMs(Date.now())
        }, 1000)
        return () => window.clearInterval(timer)
    }, [isStaticRenderer, hasActiveCountdown])

    const cardsPerPage = React.useMemo(() => {
        if (containerWidth >= 1000) return 3
        if (containerWidth >= 680) return 2
        return 1
    }, [containerWidth])

    const isNarrow = containerWidth < 680
    const isVeryNarrow = containerWidth < 460

    const pageCount = React.useMemo(() => {
        if (sortedMatches.length === 0) return 1
        return Math.max(1, Math.ceil(sortedMatches.length / cardsPerPage))
    }, [sortedMatches.length, cardsPerPage])

    React.useEffect(() => {
        if (selectedMatchIndex < 0) {
            setCurrentPage(0)
            return
        }
        const page = Math.floor(selectedMatchIndex / cardsPerPage)
        setCurrentPage(page)
    }, [selectedMatchIndex, cardsPerPage])

    React.useEffect(() => {
        if (currentPage <= pageCount - 1) return
        setCurrentPage(Math.max(0, pageCount - 1))
    }, [currentPage, pageCount])

    const pagedMatches = React.useMemo(() => {
        const pages: Array<
            Array<{ item: MatchItem; absoluteIndex: number; dateTime: Date }>
        > = []
        for (let index = 0; index < sortedMatches.length; index += cardsPerPage) {
            const pageSlice = sortedMatches.slice(index, index + cardsPerPage)
            pages.push(
                pageSlice.map((entry, localIndex) => ({
                    item: entry.match,
                    dateTime: entry.dateTime,
                    absoluteIndex: index + localIndex,
                }))
            )
        }
        return pages
    }, [sortedMatches, cardsPerPage])

    const canGoPrev = currentPage > 0
    const canGoNext = currentPage < pageCount - 1

    const countdown = React.useMemo(() => {
        if (!selectedMatchItem || !hasActiveCountdown) {
            return { days: "00", hours: "00", minutes: "00", seconds: "00" }
        }
        const diff = Math.max(0, selectedMatchItem.dateTime.getTime() - nowMs)
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
        const minutes = Math.floor((diff / (1000 * 60)) % 60)
        const seconds = Math.floor((diff / 1000) % 60)
        return {
            days: pad2(days),
            hours: pad2(hours),
            minutes: pad2(minutes),
            seconds: pad2(seconds),
        }
    }, [selectedMatchItem, hasActiveCountdown, nowMs])

    const goPrev = React.useCallback(() => {
        if (!canGoPrev) return
        setCurrentPage((prev) => Math.max(0, prev - 1))
    }, [canGoPrev])

    const goNext = React.useCallback(() => {
        if (!canGoNext) return
        setCurrentPage((prev) => Math.min(pageCount - 1, prev + 1))
    }, [canGoNext, pageCount])

    const sectionPadding = Math.max(10, Math.round(14 * safeEscalaEspaciado))

    return (
        <div
            ref={rootRef}
            style={{
                position: "relative",
                width: hasExternalWidth ? style.width : "100%",
                height: hasExternalHeight ? style.height : "auto",
                background: fondo,
                color: texto,
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: safeGapFilas,
                padding: sectionPadding,
                overflow: "hidden",
                ...style,
            }}
        >
            <div
                style={{
                    position: "relative",
                    display: "grid",
                    gridTemplateColumns: isNarrow ? "1fr" : "1fr auto 1fr",
                    alignItems: "center",
                    gap: Math.max(8, Math.round(10 * safeEscalaEspaciado)),
                }}
            >
                {!isNarrow && <div style={{ minHeight: 1 }} />}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        minWidth: 0,
                    }}
                >
                    <span
                        style={{
                            ...fuenteEtiqueta,
                            color: textoAtenuado,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            textAlign: "center",
                        }}
                    >
                        {etiquetaProximo}
                    </span>
                    {mostrarContador && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: isVeryNarrow ? 4 : 8,
                                minWidth: 0,
                            }}
                        >
                            {[
                                { value: countdown.days, label: etiquetaDias },
                                { value: countdown.hours, label: etiquetaHoras },
                                { value: countdown.minutes, label: etiquetaMin },
                                { value: countdown.seconds, label: etiquetaSeg },
                            ].map((item, index) => (
                                <React.Fragment key={`${item.label}-${index}`}>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            minWidth: 0,
                                        }}
                                    >
                                        <span
                                            style={{
                                                ...fuenteContador,
                                                color: acento,
                                                fontSize: isVeryNarrow
                                                    ? 28
                                                    : fuenteContador?.fontSize || "56px",
                                                fontVariantNumeric: "tabular-nums",
                                                lineHeight: 1,
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            {item.value}
                                        </span>
                                        <span
                                            style={{
                                                ...fuenteSecundaria,
                                                color: textoAtenuado,
                                                textTransform: "uppercase",
                                                fontSize: isVeryNarrow
                                                    ? 10
                                                    : fuenteSecundaria?.fontSize || "12px",
                                            }}
                                        >
                                            {item.label}
                                        </span>
                                    </div>
                                    {index < 3 && (
                                        <span
                                            style={{
                                                ...fuenteContador,
                                                color: acento,
                                                fontSize: isVeryNarrow
                                                    ? 28
                                                    : fuenteContador?.fontSize || "56px",
                                                lineHeight: 1,
                                                marginTop: -1,
                                            }}
                                        >
                                            :
                                        </span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </div>
                {mostrarBoton ? (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: isNarrow ? "stretch" : "flex-end",
                        }}
                    >
                        <a
                            href={enlaceBoton}
                            style={{
                                border: `1px solid ${acento}`,
                                color: acento,
                                background: "transparent",
                                borderRadius: 0,
                                textDecoration: "none",
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                                padding: isNarrow ? "10px 12px" : "9px 14px",
                                width: isNarrow ? "100%" : "auto",
                                textAlign: "center",
                                ...fuenteEtiqueta,
                            }}
                        >
                            {textoBoton}
                        </a>
                    </div>
                ) : !isNarrow ? (
                    <div />
                ) : null}
            </div>

            {sortedMatches.length === 0 ? (
                <div
                    style={{
                        border: `1px dashed ${lineas}`,
                        padding: "16px",
                        textAlign: "center",
                        color: textoAtenuado,
                        textTransform: "uppercase",
                        ...fuenteEtiqueta,
                    }}
                >
                    {textoVacio}
                </div>
            ) : (
                <div style={{ width: "100%", minWidth: 0, overflow: "hidden" }}>
                    <div
                        style={{
                            display: "flex",
                            width: "100%",
                            transform: `translateX(-${currentPage * 100}%)`,
                            transition: isStaticRenderer
                                ? "none"
                                : "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
                        }}
                    >
                        {pagedMatches.map((pageItems, pageIndex) => {
                            const visibleColumns = Math.max(
                                1,
                                Math.min(cardsPerPage, pageItems.length)
                            )
                            const visibleGridWidth = `${(visibleColumns / cardsPerPage) * 100}%`
                            const isActivePage = pageIndex === currentPage

                            return (
                                <div
                                    key={`page-${pageIndex}`}
                                    style={{
                                        flex: "0 0 100%",
                                        minWidth: 0,
                                        boxSizing: "border-box",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: `repeat(${visibleColumns}, minmax(0, 1fr))`,
                                            gap: Math.max(
                                                8,
                                                Math.round(10 * safeEscalaEspaciado)
                                            ),
                                            width: visibleGridWidth,
                                            margin: "0 auto",
                                            opacity: isStaticRenderer
                                                ? 1
                                                : isActivePage
                                                  ? 1
                                                  : 0.35,
                                            transform: isStaticRenderer
                                                ? "scale(1)"
                                                : isActivePage
                                                  ? "scale(1)"
                                                  : "scale(0.98)",
                                            transition: isStaticRenderer
                                                ? "none"
                                                : "opacity 0.45s ease, transform 0.45s ease",
                                        }}
                                    >
                                        {pageItems.map(
                                            ({ item, dateTime, absoluteIndex }) => {
                                                const isNext =
                                                    absoluteIndex === selectedMatchIndex
                                                const isFinished =
                                                    item.condition === "finalizado"
                                                const isLive =
                                                    item.condition === "en_curso"

                                                const ownCrest =
                                                    item.logo?.src
                                                        ? item.logo
                                                        : escudoPropio?.src
                                                          ? escudoPropio
                                                          : undefined

                                                const mainLine =
                                                    isFinished || isLive
                                                        ? `${Number.isFinite(item.carrerasLocal) ? item.carrerasLocal : 0} : ${Number.isFinite(item.carrerasVisitante) ? item.carrerasVisitante : 0}`
                                                        : formatDateLine(dateTime)

                                                const secondaryLine = isFinished
                                                    ? item.detalleFinal
                                                        ? `(${normalizeFinishDetail(item.detalleFinal)})`
                                                        : etiquetaFinalizado
                                                    : isLive
                                                      ? etiquetaEnCurso
                                                      : `${item.time || "00:00"} ${sufijoHora}`

                                                const cardContent = (
                                                    <div
                                                        style={{
                                                            position: "relative",
                                                            minWidth: 0,
                                                            display: "grid",
                                                            gridTemplateColumns: `${Math.max(38, isVeryNarrow ? safeAnchoFranja - 10 : safeAnchoFranja)}px minmax(0, 1fr)`,
                                                            width: "100%",
                                                            minHeight: isVeryNarrow
                                                                ? safeAltoTarjeta - 14
                                                                : safeAltoTarjeta,
                                                            border: `${isNext || isLive ? 2 : 1}px solid ${isLive ? "#FF3B30" : isNext ? acento : lineas}`,
                                                            background: superficie,
                                                            boxShadow: sombraCard,
                                                            boxSizing: "border-box",
                                                        }}
                                                    >
                                                        {isLive ? (
                                                            <span
                                                                style={{
                                                                    position: "absolute",
                                                                    top: -12,
                                                                    left: "50%",
                                                                    transform: "translateX(-50%)",
                                                                    zIndex: 2,
                                                                    background: "#FF3B30",
                                                                    color: "#FFFFFF",
                                                                    lineHeight: 1,
                                                                    padding: "3px 8px",
                                                                    textTransform: "uppercase",
                                                                    letterSpacing: "0.06em",
                                                                    whiteSpace: "nowrap",
                                                                    fontWeight: 700,
                                                                    fontSize: 10,
                                                                }}
                                                            >
                                                                ● EN VIVO
                                                            </span>
                                                        ) : isNext ? (
                                                            <span
                                                                style={{
                                                                    position: "absolute",
                                                                    top: -12,
                                                                    left: "50%",
                                                                    transform: "translateX(-50%)",
                                                                    zIndex: 2,
                                                                    background: acento,
                                                                    color: "#000000",
                                                                    lineHeight: 1,
                                                                    padding: "2px 8px",
                                                                    textTransform: "uppercase",
                                                                    letterSpacing: "0.06em",
                                                                    whiteSpace: "nowrap",
                                                                    fontWeight: 700,
                                                                    fontSize: 11,
                                                                    ...fuenteEtiqueta,
                                                                }}
                                                            >
                                                                {etiquetaBadge}
                                                            </span>
                                                        ) : null}

                                                        <div
                                                            style={{
                                                                background: isLive ? "#FF3B30" : acento,
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                            }}
                                                        >
                                                            {iconoFranja?.src ? (
                                                                <img
                                                                    src={iconoFranja.src}
                                                                    srcSet={iconoFranja.srcSet}
                                                                    alt={iconoFranja.alt || ""}
                                                                    style={{
                                                                        width: 20,
                                                                        height: 20,
                                                                        objectFit: "contain",
                                                                    }}
                                                                />
                                                            ) : (
                                                                <svg
                                                                    width={20}
                                                                    height={20}
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="#000000"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                >
                                                                    <circle cx="12" cy="12" r="10" />
                                                                    <polyline points="12 6 12 12 16 14" />
                                                                </svg>
                                                            )}
                                                        </div>

                                                        <div
                                                            style={{
                                                                minWidth: 0,
                                                                display: "grid",
                                                                gridTemplateColumns: "auto minmax(0, 1fr) auto",
                                                                alignItems: "center",
                                                                gap: isVeryNarrow ? 8 : 12,
                                                                padding: isVeryNarrow
                                                                    ? "10px 10px"
                                                                    : "12px 14px",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    width: safeTamanoEscudo,
                                                                    display: "flex",
                                                                    justifyContent: "center",
                                                                }}
                                                            >
                                                                {ownCrest?.src ? (
                                                                    <img
                                                                        src={ownCrest.src}
                                                                        srcSet={ownCrest.srcSet}
                                                                        alt={ownCrest.alt || "Escudo local"}
                                                                        style={{
                                                                            width: safeTamanoEscudo,
                                                                            height: safeTamanoEscudo,
                                                                            objectFit: "contain",
                                                                        }}
                                                                    />
                                                                ) : null}
                                                            </div>

                                                            <div
                                                                style={{
                                                                    minWidth: 0,
                                                                    display: "flex",
                                                                    flexDirection: "column",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    gap: 4,
                                                                    textAlign: "center",
                                                                }}
                                                            >
                                                                <span
                                                                    style={{
                                                                        ...fuenteCompetencia,
                                                                        color: textoAtenuado,
                                                                        textTransform: "uppercase",
                                                                        whiteSpace: "nowrap",
                                                                        overflow: "hidden",
                                                                        textOverflow: "ellipsis",
                                                                        maxWidth: "100%",
                                                                    }}
                                                                >
                                                                    {item.competencia}
                                                                </span>
                                                                <span
                                                                    style={{
                                                                        ...fuentePrincipal,
                                                                        color: texto,
                                                                        fontVariantNumeric: "tabular-nums",
                                                                        whiteSpace: "nowrap",
                                                                    }}
                                                                >
                                                                    {mainLine}
                                                                </span>
                                                                <span
                                                                    style={{
                                                                        ...fuenteSecundaria,
                                                                        color: isLive ? "#FF3B30" : textoAtenuado,
                                                                        fontWeight: isLive ? "bold" : "normal",
                                                                        whiteSpace: "nowrap",
                                                                        overflow: "hidden",
                                                                        textOverflow: "ellipsis",
                                                                        maxWidth: "100%",
                                                                    }}
                                                                >
                                                                    {secondaryLine}
                                                                </span>
                                                            </div>

                                                            <div
                                                                style={{
                                                                    width: safeTamanoEscudo,
                                                                    display: "flex",
                                                                    justifyContent: "center",
                                                                }}
                                                            >
                                                                {item.logoRival?.src ? (
                                                                    <img
                                                                        src={item.logoRival.src}
                                                                        srcSet={item.logoRival.srcSet}
                                                                        alt={item.logoRival.alt || item.opponent}
                                                                        style={{
                                                                            width: safeTamanoEscudo,
                                                                            height: safeTamanoEscudo,
                                                                            objectFit: "contain",
                                                                        }}
                                                                    />
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )

                                                return item.link ? (
                                                    <a
                                                        key={`partido-${absoluteIndex}`}
                                                        href={item.link}
                                                        style={{
                                                            minWidth: 0,
                                                            textDecoration: "none",
                                                            display: "block",
                                                        }}
                                                    >
                                                        {cardContent}
                                                    </a>
                                                ) : (
                                                    <div
                                                        key={`partido-${absoluteIndex}`}
                                                        style={{ minWidth: 0 }}
                                                    >
                                                        {cardContent}
                                                    </div>
                                                )
                                            }
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {mostrarControles && pageCount > 1 && (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 8,
                        width: "100%",
                        marginTop: 4,
                    }}
                >
                    <button
                        type="button"
                        onClick={goPrev}
                        disabled={!canGoPrev}
                        aria-label="Anterior"
                        style={{
                            border: `1px solid ${lineas}`,
                            background: "transparent",
                            color: texto,
                            borderRadius: 0,
                            width: 32,
                            height: 32,
                            cursor: canGoPrev ? "pointer" : "default",
                            opacity: canGoPrev ? 1 : 0.4,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <svg
                            width={safeTamanoIconoNav}
                            height={safeTamanoIconoNav}
                            viewBox="0 0 16 16"
                        >
                            <path
                                d="M10.2 3.2L5.5 8l4.7 4.8"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        {Array.from({ length: pageCount }).map((_, dotIndex) => (
                            <button
                                key={`dot-${dotIndex}`}
                                type="button"
                                onClick={() => setCurrentPage(dotIndex)}
                                aria-label={`Página ${dotIndex + 1}`}
                                style={{
                                    border: "none",
                                    background:
                                        dotIndex === currentPage
                                            ? acento
                                            : "rgba(255,255,255,0.3)",
                                    width: dotIndex === currentPage ? 22 : 8,
                                    height: 8,
                                    borderRadius: 999,
                                    cursor: "pointer",
                                    padding: 0,
                                    transition: "all 0.3s ease",
                                }}
                            />
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={goNext}
                        disabled={!canGoNext}
                        aria-label="Siguiente"
                        style={{
                            border: `1px solid ${lineas}`,
                            background: "transparent",
                            color: texto,
                            borderRadius: 0,
                            width: 32,
                            height: 32,
                            cursor: canGoNext ? "pointer" : "default",
                            opacity: canGoNext ? 1 : 0.4,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <svg
                            width={safeTamanoIconoNav}
                            height={safeTamanoIconoNav}
                            viewBox="0 0 16 16"
                        >
                            <path
                                d="M5.8 3.2L10.5 8l-4.7 4.8"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    )
}

UpcomingGames.displayName = "Upcoming Games"

addPropertyControls(UpcomingGames, {
    partidos: {
        type: ControlType.Array,
        title: "Partidos",
        control: {
            type: ControlType.Object,
            controls: {
                date: { type: ControlType.Date, title: "Fecha" },
                time: {
                    type: ControlType.String,
                    title: "Hora",
                    defaultValue: "19:00",
                },
                competencia: {
                    type: ControlType.String,
                    title: "Competición",
                    defaultValue: "FLAG NATION",
                },
                opponent: {
                    type: ControlType.String,
                    title: "Rival",
                    defaultValue: "Rebels",
                },
                logo: {
                    type: ControlType.ResponsiveImage,
                    title: "Escudo Local",
                },
                logoRival: {
                    type: ControlType.ResponsiveImage,
                    title: "Escudo Rival",
                },
                carrerasLocal: {
                    type: ControlType.Number,
                    title: "Puntos Local",
                    defaultValue: 0,
                    min: 0,
                    max: 99,
                    step: 1,
                },
                carrerasVisitante: {
                    type: ControlType.Number,
                    title: "Puntos Visita",
                    defaultValue: 0,
                    min: 0,
                    max: 99,
                    step: 1,
                },
                detalleFinal: {
                    type: ControlType.String,
                    title: "Detalle Final",
                    defaultValue: "",
                },
                condition: {
                    type: ControlType.Enum,
                    title: "Condición",
                    options: ["local", "visitante", "en_curso", "finalizado"],
                    optionTitles: ["Local", "Visitante", "En Curso (Live)", "Finalizado"],
                    defaultValue: "local",
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
                date: "2026-10-15T19:00:00.000Z",
                time: "19:00",
                competencia: "FLAG NATION",
                opponent: "Rebels",
                carrerasLocal: 0,
                carrerasVisitante: 0,
                detalleFinal: "",
                condition: "local",
                link: "",
            },
        ],
    },
    fondo: {
        type: ControlType.Color,
        title: "Fondo",
        defaultValue: "#000000",
    },
    superficie: {
        type: ControlType.Color,
        title: "Superficie",
        defaultValue: "#121212",
    },
    acento: {
        type: ControlType.Color,
        title: "Color Acento",
        defaultValue: "#FF6B00",
    },
    texto: { type: ControlType.Color, title: "Texto", defaultValue: "#FFFFFF" },
    textoAtenuado: {
        type: ControlType.Color,
        title: "Texto Tenue",
        defaultValue: "rgba(255,255,255,0.5)",
    },
    lineas: {
        type: ControlType.Color,
        title: "Bordes",
        defaultValue: "rgba(255,255,255,0.15)",
    },
    sombraCard: { type: ControlType.BoxShadow, title: "Sombra Tarjeta" },
    fuenteEtiqueta: {
        type: ControlType.Font,
        title: "Fuente Etiquetas",
        controls: "extended",
    },
    fuenteContador: {
        type: ControlType.Font,
        title: "Fuente Contador",
        controls: "extended",
    },
    fuenteCompetencia: {
        type: ControlType.Font,
        title: "Fuente Competición",
        controls: "extended",
    },
    fuentePrincipal: {
        type: ControlType.Font,
        title: "Fuente Principal",
        controls: "extended",
    },
    fuenteSecundaria: {
        type: ControlType.Font,
        title: "Fuente Secundaria",
        controls: "extended",
    },
    tamanoEscudo: {
        type: ControlType.Number,
        title: "Tamaño Escudo",
        defaultValue: 40,
        min: 20,
        max: 90,
        step: 1,
        unit: "px",
    },
    anchoFranja: {
        type: ControlType.Number,
        title: "Ancho Franja",
        defaultValue: 56,
        min: 40,
        max: 120,
        step: 1,
        unit: "px",
    },
    altoTarjeta: {
        type: ControlType.Number,
        title: "Alto Tarjeta",
        defaultValue: 116,
        min: 86,
        max: 260,
        step: 1,
        unit: "px",
    },
    gapFilas: {
        type: ControlType.Number,
        title: "Espaciado Filas",
        defaultValue: 16,
        min: 0,
        max: 80,
        step: 2,
    },
    escalaEspaciado: {
        type: ControlType.Number,
        title: "Escala Espaciado",
        defaultValue: 1,
        min: 0.7,
        max: 2,
        step: 0.05,
    },
    tamanoIconoNav: {
        type: ControlType.Number,
        title: "Tamaño Flechas",
        defaultValue: 14,
        min: 10,
        max: 40,
        step: 1,
        unit: "px",
    },
    iconoFranja: { type: ControlType.ResponsiveImage, title: "Icono Franja" },
    escudoPropio: {
        type: ControlType.ResponsiveImage,
        title: "Escudo Propio",
    },
    etiquetaProximo: {
        type: ControlType.String,
        title: "Texto Próximo",
        defaultValue: "Próximo Encuentro",
    },
    etiquetaBadge: {
        type: ControlType.String,
        title: "Texto Badge",
        defaultValue: "Siguiente",
    },
    etiquetaDias: {
        type: ControlType.String,
        title: "Etiqueta Días",
        defaultValue: "Días",
    },
    etiquetaHoras: {
        type: ControlType.String,
        title: "Etiqueta Horas",
        defaultValue: "Hrs",
    },
    etiquetaMin: {
        type: ControlType.String,
        title: "Etiqueta Minutos",
        defaultValue: "Min",
    },
    etiquetaSeg: {
        type: ControlType.String,
        title: "Etiqueta Segundos",
        defaultValue: "Seg",
    },
    textoBoton: {
        type: ControlType.String,
        title: "Texto Botón",
        defaultValue: "Ver Calendario",
    },
    sufijoHora: {
        type: ControlType.String,
        title: "Sufijo Horario",
        defaultValue: "GMT-6",
    },
    etiquetaFinalizado: {
        type: ControlType.String,
        title: "Etiqueta Finalizado",
        defaultValue: "Finalizado",
    },
    etiquetaEnCurso: {
        type: ControlType.String,
        title: "Etiqueta En Vivo",
        defaultValue: "EN VIVO",
    },
    textoVacio: {
        type: ControlType.String,
        title: "Texto Sin Partidos",
        defaultValue: "No hay partidos programados",
    },
    enlaceBoton: {
        type: ControlType.Link,
        title: "Enlace Botón",
        defaultValue: "calendar.html",
    },
    mostrarContador: {
        type: ControlType.Boolean,
        title: "Mostrar Contador",
        defaultValue: true,
    },
    mostrarBoton: {
        type: ControlType.Boolean,
        title: "Mostrar Botón",
        defaultValue: true,
    },
    mostrarControles: {
        type: ControlType.Boolean,
        title: "Mostrar Controles",
        defaultValue: true,
    },
})
