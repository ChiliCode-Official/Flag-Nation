import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

interface MatchItem {
    date: string
    time: string
    opponent: string
    logo?: {
        src?: string
        srcSet?: string
        alt?: string
    }
    logoRivalFinal?: {
        src?: string
        srcSet?: string
        alt?: string
    }
    carrerasLocal?: number
    carrerasVisitante?: number
    condition: "local" | "visitante" | "finalizado"
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
    variant?: string
}

interface MyComponentProps {
    matches: MatchItem[]
    initialMonth: number
    initialYear: number
    firstDayOfWeek: "domingo" | "lunes"
    backgroundColor: string
    cellSurfaceColor: string
    accentLocalColor: string
    visitorSurfaceColor: string
    textColor: string
    mutedTextColor: string
    lineColor: string
    monthTitleFont?: FontStyleValue
    dayHeaderFont?: FontStyleValue
    dayNumberFont?: FontStyleValue
    matchDataFont?: FontStyleValue
    cellMinHeight: number
    crestSize: number
    crestVerticalOffset: number
    spacingScale: number
    conditionIconSize: number
    navIconSize: number
    localConditionIcon?: {
        src?: string
        srcSet?: string
        alt?: string
    }
    visitorConditionIcon?: {
        src?: string
        srcSet?: string
        alt?: string
    }
    finishedConditionIcon?: {
        src?: string
        srcSet?: string
        alt?: string
    }
    prevNavIcon?: {
        src?: string
        srcSet?: string
        alt?: string
    }
    nextNavIcon?: {
        src?: string
        srcSet?: string
        alt?: string
    }
    showWeekFilter: boolean
    showLegend: boolean
    localLabel: string
    visitorLabel: string
    finishedLabel: string
    timezoneNote: string
    vsLabel: string
    enLabel: string
    finishedTagColor: string
    emptyStateText: string
    resetLabel: string
    modo: "Completo" | "Compacto"
    compactTileSize: number
    activarEjemploFinalizado: boolean
    indiceEjemploFinalizado: number
    carrerasLocalEjemplo: number
    carrerasVisitanteEjemplo: number
    logoRivalFinalEjemplo?: {
        src?: string
        srcSet?: string
        alt?: string
    }
    style?: React.CSSProperties
}

const DAYS_SUNDAY_FIRST = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"]
const DAYS_MONDAY_FIRST = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"]
const MONTHS_ES = [
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE",
]

function toDateKey(date: Date): string {
    const y = date.getFullYear()
    const m = `${date.getMonth() + 1}`.padStart(2, "0")
    const d = `${date.getDate()}`.padStart(2, "0")
    return `${y}-${m}-${d}`
}

function parseDateKey(rawDate: string): string | null {
    if (!rawDate) return null
    const match = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (match) return `${match[1]}-${match[2]}-${match[3]}`
    return null
}

function parseTimeToMinutes(value: string): number {
    const match = (value || "").match(/^(\d{1,2}):(\d{2})/)
    if (!match) return Number.POSITIVE_INFINITY
    const hours = Math.max(0, Math.min(23, Number(match[1])))
    const minutes = Math.max(0, Math.min(59, Number(match[2])))
    return hours * 60 + minutes
}

function normalizeMondayFirstDay(day: number): number {
    return day === 0 ? 6 : day - 1
}

export default function MatchCalendar(props: MyComponentProps) {
    const {
        matches = [],
        initialMonth = 10,
        initialYear = 2026,
        firstDayOfWeek = "domingo",
        backgroundColor = "#0A0B0C",
        cellSurfaceColor = "#121212",
        accentLocalColor = "#FF6B00",
        visitorSurfaceColor = "rgba(255,255,255,0.08)",
        textColor = "#FFFFFF",
        mutedTextColor = "rgba(255,255,255,0.5)",
        lineColor = "rgba(255,255,255,0.15)",
        monthTitleFont = {},
        dayHeaderFont = {},
        dayNumberFont = {},
        matchDataFont = {},
        cellMinHeight = 120,
        crestSize = 32,
        crestVerticalOffset = -6,
        spacingScale = 1,
        conditionIconSize = 12,
        navIconSize = 14,
        localConditionIcon,
        visitorConditionIcon,
        finishedConditionIcon,
        prevNavIcon,
        nextNavIcon,
        showWeekFilter = true,
        showLegend = true,
        localLabel = "Local",
        visitorLabel = "Visitante",
        finishedLabel = "Final",
        timezoneNote = "Horario de Querétaro (GMT-6)",
        vsLabel = "VS",
        enLabel = "@",
        finishedTagColor = "rgba(255,107,0,0.3)",
        emptyStateText = "No hay partidos programados para este mes",
        resetLabel = "Hoy",
        modo = "Completo",
        compactTileSize = 44,
        activarEjemploFinalizado = false,
        indiceEjemploFinalizado = 1,
        carrerasLocalEjemplo = 0,
        carrerasVisitanteEjemplo = 0,
        logoRivalFinalEjemplo,
        style = {},
    } = props

    const isStaticRenderer = typeof window === "undefined"
    const hasExternalWidth = style.width !== undefined
    const hasExternalHeight = style.height !== undefined
    const safeSpacingScale = Number.isFinite(spacingScale)
        ? Math.max(0.7, Number(spacingScale))
        : 1
    const baseGap = Math.max(6, Math.round(12 * safeSpacingScale))
    const basePadding = Math.max(8, Math.round(16 * safeSpacingScale))
    const safeCellMinHeight = Math.max(
        56,
        Number.isFinite(cellMinHeight) ? Number(cellMinHeight) : 120
    )
    const safeCrestSize = Math.max(
        18,
        Number.isFinite(crestSize) ? Number(crestSize) : 32
    )
    const safeCompactTileSize = Math.max(
        28,
        Number.isFinite(compactTileSize) ? Number(compactTileSize) : 44
    )
    const isCompactMode = modo === "Compacto"
    const finishedScoreTextEnhancement: React.CSSProperties = {
        color: "#FFFFFF",
        fontWeight: 700,
        textShadow: "0 1px 2px rgba(0,0,0,0.55)",
    }

    const [containerWidth, setContainerWidth] = React.useState(() => {
        if (typeof style.width === "number") return style.width
        return 1200
    })

    const initialDate = React.useMemo(() => {
        const monthSafe = Math.min(
            12,
            Math.max(
                1,
                Number.isFinite(initialMonth)
                    ? Number(initialMonth)
                    : new Date().getMonth() + 1
            )
        )
        const yearSafe = Math.max(
            1900,
            Number.isFinite(initialYear)
                ? Number(initialYear)
                : new Date().getFullYear()
        )
        return new Date(yearSafe, monthSafe - 1, 1)
    }, [initialMonth, initialYear])

    const [viewDate, setViewDate] = React.useState<Date>(initialDate)
    const [selectedWeek, setSelectedWeek] = React.useState<number>(-1)
    const [selectedDayKey, setSelectedDayKey] = React.useState<string | null>(null)

    const rootRef = React.useRef<HTMLDivElement | null>(null)
    const compactInteractionRef = React.useRef<HTMLDivElement | null>(null)

    React.useEffect(() => {
        setViewDate(initialDate)
        setSelectedWeek(-1)
        setSelectedDayKey(null)
    }, [initialDate])

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

    const isNarrow = containerWidth < 760
    const isVeryNarrow = containerWidth < 540
    const showOpponentName = !isVeryNarrow
    const dayHeaders =
        firstDayOfWeek === "lunes" ? DAYS_MONDAY_FIRST : DAYS_SUNDAY_FIRST
    const compactHeaders = React.useMemo(
        () => dayHeaders.map((day) => day.slice(0, 1)),
        [dayHeaders]
    )

    const preparedMatches = React.useMemo<MatchItem[]>(() => {
        const baseMatches = (matches || []).map((match) => ({
            ...match,
            logo: match.logo ? { ...match.logo } : undefined,
            logoRivalFinal: match.logoRivalFinal
                ? { ...match.logoRivalFinal }
                : undefined,
        }))
        if (!activarEjemploFinalizado || baseMatches.length === 0)
            return baseMatches

        const rawIndex = Number.isFinite(indiceEjemploFinalizado)
            ? Math.floor(indiceEjemploFinalizado)
            : 1
        const forcedIndex = Math.max(1, rawIndex) - 1
        if (forcedIndex < 0 || forcedIndex >= baseMatches.length)
            return baseMatches

        const targetMatch = baseMatches[forcedIndex]
        baseMatches[forcedIndex] = {
            ...targetMatch,
            condition: "finalizado",
            time: "Final",
            carrerasLocal: carrerasLocalEjemplo,
            carrerasVisitante: carrerasVisitanteEjemplo,
            logoRivalFinal: logoRivalFinalEjemplo?.src ? { ...logoRivalFinalEjemplo } : targetMatch.logoRivalFinal,
        }

        return baseMatches
    }, [
        matches,
        activarEjemploFinalizado,
        indiceEjemploFinalizado,
        carrerasLocalEjemplo,
        carrerasVisitanteEjemplo,
        logoRivalFinalEjemplo,
    ])

    const normalizedMatches = React.useMemo(() => {
        return (preparedMatches || [])
            .map((match, index) => {
                const key = parseDateKey(match.date)
                if (!key) return null
                return {
                    match,
                    key,
                    timeMinutes: parseTimeToMinutes(match.time),
                    originalIndex: index,
                }
            })
            .filter(
                (item): item is {
                    match: MatchItem
                    key: string
                    timeMinutes: number
                    originalIndex: number
                } => Boolean(item)
            )
            .sort((a, b) => {
                if (a.key < b.key) return -1
                if (a.key > b.key) return 1
                if (a.timeMinutes !== b.timeMinutes)
                    return a.timeMinutes - b.timeMinutes
                return a.originalIndex - b.originalIndex
            })
    }, [preparedMatches])

    const matchesByDate = React.useMemo(() => {
        const map = new Map<string, MatchItem[]>()
        for (const item of normalizedMatches) {
            const list = map.get(item.key) || []
            list.push(item.match)
            map.set(item.key, list)
        }
        return map
    }, [normalizedMatches])

    const monthYearLabel = React.useMemo(() => {
        return {
            month: MONTHS_ES[viewDate.getMonth()] || "MES",
            year: viewDate.getFullYear().toString(),
        }
    }, [viewDate])

    const monthGrid = React.useMemo(() => {
        const monthStart = new Date(
            viewDate.getFullYear(),
            viewDate.getMonth(),
            1
        )
        const monthEnd = new Date(
            viewDate.getFullYear(),
            viewDate.getMonth() + 1,
            0
        )
        const firstWeekDay =
            firstDayOfWeek === "lunes"
                ? normalizeMondayFirstDay(monthStart.getDay())
                : monthStart.getDay()
        const startDate = new Date(monthStart)
        startDate.setDate(monthStart.getDate() - firstWeekDay)

        const lastWeekDay =
            firstDayOfWeek === "lunes"
                ? normalizeMondayFirstDay(monthEnd.getDay())
                : monthEnd.getDay()
        const endDate = new Date(monthEnd)
        endDate.setDate(monthEnd.getDate() + (6 - lastWeekDay))

        const weeks: Date[][] = []
        const cursor = new Date(startDate)
        while (cursor <= endDate) {
            const week: Date[] = []
            for (let i = 0; i < 7; i++) {
                week.push(new Date(cursor))
                cursor.setDate(cursor.getDate() + 1)
            }
            weeks.push(week)
        }
        return weeks
    }, [viewDate, firstDayOfWeek])

    const displayedWeeks = React.useMemo(() => {
        if (isCompactMode) return monthGrid
        if (selectedWeek < 0) return monthGrid
        return monthGrid[selectedWeek] ? [monthGrid[selectedWeek]] : monthGrid
    }, [monthGrid, selectedWeek, isCompactMode])

    const monthHasMatches = React.useMemo(() => {
        for (const week of monthGrid) {
            for (const day of week) {
                if (
                    day.getMonth() !== viewDate.getMonth() ||
                    day.getFullYear() !== viewDate.getFullYear()
                )
                    continue
                const key = toDateKey(day)
                if ((matchesByDate.get(key) || []).length > 0) return true
            }
        }
        return false
    }, [monthGrid, viewDate, matchesByDate])

    const goPrevMonth = React.useCallback(() => {
        setViewDate(
            (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
        )
        setSelectedWeek(-1)
        setSelectedDayKey(null)
    }, [])

    const goNextMonth = React.useCallback(() => {
        setViewDate(
            (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
        )
        setSelectedWeek(-1)
        setSelectedDayKey(null)
    }, [])

    const goToInitial = React.useCallback(() => {
        setViewDate(initialDate)
        setSelectedWeek(-1)
        setSelectedDayKey(null)
    }, [initialDate])

    const handleCompactDayTap = React.useCallback(
        (key: string, hasMatch: boolean) => {
            if (!hasMatch) return
            setSelectedDayKey((prev) => (prev === key ? null : key))
        },
        []
    )

    return (
        <div
            ref={rootRef}
            style={{
                position: "relative",
                width: hasExternalWidth ? style.width : "100%",
                height: hasExternalHeight ? style.height : "auto",
                background: backgroundColor,
                color: textColor,
                boxSizing: "border-box",
                padding: basePadding,
                display: "flex",
                flexDirection: "column",
                gap: baseGap,
                overflow: "hidden",
                ...style,
            }}
            aria-label="Flag Nation Match Calendar"
        >
            <div
                style={{
                    position: "relative",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    borderBottom: `1px solid ${lineColor}`,
                    paddingBottom: Math.max(8, Math.round(10 * safeSpacingScale)),
                }}
            >
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span
                        style={{
                            ...monthTitleFont,
                            color: accentLocalColor,
                            textTransform: "uppercase",
                            fontSize: isCompactMode ? 22 : monthTitleFont?.fontSize || "32px",
                        }}
                    >
                        {monthYearLabel.month}
                    </span>
                    <span
                        style={{
                            ...monthTitleFont,
                            color: textColor,
                            fontSize: isCompactMode ? 22 : monthTitleFont?.fontSize || "32px",
                        }}
                    >
                        {monthYearLabel.year}
                    </span>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <button
                        type="button"
                        onClick={goPrevMonth}
                        aria-label="Mes anterior"
                        style={{
                            border: `1px solid ${lineColor}`,
                            background: "transparent",
                            color: textColor,
                            height: isCompactMode ? 32 : 36,
                            minWidth: isCompactMode ? 32 : 36,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        ‹
                    </button>
                    <button
                        type="button"
                        onClick={goNextMonth}
                        aria-label="Siguiente mes"
                        style={{
                            border: `1px solid ${lineColor}`,
                            background: "transparent",
                            color: textColor,
                            height: isCompactMode ? 32 : 36,
                            minWidth: isCompactMode ? 32 : 36,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        ›
                    </button>
                    <button
                        type="button"
                        onClick={goToInitial}
                        style={{
                            border: `1px solid ${lineColor}`,
                            background: cellSurfaceColor,
                            color: mutedTextColor,
                            height: isCompactMode ? 32 : 36,
                            padding: isCompactMode ? "0 10px" : "0 12px",
                            cursor: "pointer",
                            textTransform: "uppercase",
                            ...dayHeaderFont,
                        }}
                    >
                        {resetLabel}
                    </button>
                </div>
            </div>

            {showWeekFilter && !isCompactMode && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                    <button
                        type="button"
                        onClick={() => setSelectedWeek(-1)}
                        style={{
                            border: `1px solid ${selectedWeek === -1 ? accentLocalColor : lineColor}`,
                            background: selectedWeek === -1 ? accentLocalColor : "transparent",
                            color: selectedWeek === -1 ? "#111111" : textColor,
                            padding: "6px 10px",
                            cursor: "pointer",
                            textTransform: "uppercase",
                            ...dayHeaderFont,
                        }}
                    >
                        Todos
                    </button>
                    {monthGrid.map((_, index) => (
                        <button
                            key={`week-${index}`}
                            type="button"
                            onClick={() => setSelectedWeek(index)}
                            style={{
                                border: `1px solid ${selectedWeek === index ? accentLocalColor : lineColor}`,
                                background: selectedWeek === index ? accentLocalColor : "transparent",
                                color: selectedWeek === index ? "#111111" : textColor,
                                padding: "6px 10px",
                                cursor: "pointer",
                                textTransform: "uppercase",
                                ...dayHeaderFont,
                            }}
                        >
                            S{index + 1}
                        </button>
                    ))}
                </div>
            )}

            <div
                ref={compactInteractionRef}
                style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                        gap: 0,
                        borderTop: `1px solid ${lineColor}`,
                        borderLeft: `1px solid ${lineColor}`,
                        width: "100%",
                        overflow: "hidden",
                    }}
                >
                    {(isCompactMode ? compactHeaders : dayHeaders).map((day, index) => (
                        <div
                            key={`${day}-${index}`}
                            style={{
                                borderRight: `1px solid ${lineColor}`,
                                borderBottom: `1px solid ${lineColor}`,
                                padding: isCompactMode ? "6px 4px" : isNarrow ? "8px 6px" : "10px 8px",
                                background: isCompactMode ? cellSurfaceColor : "#121212",
                                color: mutedTextColor,
                                textTransform: "uppercase",
                                textAlign: "center",
                                ...dayHeaderFont,
                            }}
                        >
                            {day}
                        </div>
                    ))}

                    {displayedWeeks.flat().map((day) => {
                        const isCurrentMonth =
                            day.getMonth() === viewDate.getMonth() &&
                            day.getFullYear() === viewDate.getFullYear()
                        const key = toDateKey(day)
                        const dayMatches = matchesByDate.get(key) || []
                        const firstMatch = dayMatches[0]
                        const isLocal = firstMatch?.condition === "local"
                        const isFinished = firstMatch?.condition === "finalizado"
                        const finalRivalLogo = isFinished ? firstMatch?.logoRivalFinal : undefined
                        const hasMatchInCurrentMonth = Boolean(firstMatch && isCurrentMonth)

                        const dayCellTextColor = hasMatchInCurrentMonth
                            ? isLocal ? "#111111" : textColor
                            : isCurrentMonth ? textColor : mutedTextColor

                        const dayCellBackground = hasMatchInCurrentMonth
                            ? isLocal ? accentLocalColor : isFinished ? finishedTagColor : visitorSurfaceColor
                            : isCurrentMonth ? cellSurfaceColor : "#0F1011"

                        if (isCompactMode) {
                            return (
                                <div
                                    key={key}
                                    style={{
                                        borderRight: `1px solid ${lineColor}`,
                                        borderBottom: `1px solid ${lineColor}`,
                                        background: isCurrentMonth ? cellSurfaceColor : backgroundColor,
                                        boxSizing: "border-box",
                                        width: "100%",
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleCompactDayTap(key, hasMatchInCurrentMonth)}
                                        style={{
                                            width: "100%",
                                            minHeight: safeCompactTileSize,
                                            aspectRatio: "1 / 1",
                                            border: "none",
                                            background: "transparent",
                                            color: isCurrentMonth ? textColor : mutedTextColor,
                                            cursor: hasMatchInCurrentMonth ? "pointer" : "default",
                                            padding: "2px 2px 4px",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            boxSizing: "border-box",
                                        }}
                                    >
                                        <span
                                            style={{
                                                ...dayNumberFont,
                                                fontSize: 12,
                                                lineHeight: 1,
                                                opacity: isCurrentMonth ? 1 : 0.45,
                                            }}
                                        >
                                            {day.getDate()}
                                        </span>
                                        {hasMatchInCurrentMonth && (
                                            <span
                                                style={{
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: "999px",
                                                    background: isLocal
                                                        ? accentLocalColor
                                                        : isFinished
                                                          ? finishedTagColor
                                                          : "transparent",
                                                    border: `1px solid ${isLocal ? accentLocalColor : isFinished ? finishedTagColor : mutedTextColor}`,
                                                }}
                                            />
                                        )}
                                    </button>
                                </div>
                            )
                        }

                        const cellInner = (
                            <div
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    minHeight: 0,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    gap: 6,
                                    boxSizing: "border-box",
                                    padding: isNarrow ? "6px" : "8px",
                                }}
                            >
                                <div
                                    style={{
                                        ...dayNumberFont,
                                        color: dayCellTextColor,
                                        opacity: isCurrentMonth ? 1 : 0.6,
                                        textAlign: "right",
                                    }}
                                >
                                    {day.getDate()}
                                </div>

                                {hasMatchInCurrentMonth ? (
                                    <div
                                        style={{
                                            flex: 1,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        {isFinished ? (
                                            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%" }}>
                                                {firstMatch.logo?.src && (
                                                    <img
                                                        src={firstMatch.logo.src}
                                                        alt="Local"
                                                        style={{ width: safeCrestSize * 0.75, height: safeCrestSize * 0.75, objectFit: "contain" }}
                                                    />
                                                )}
                                                <span style={{ ...matchDataFont, ...finishedScoreTextEnhancement }}>
                                                    {firstMatch.carrerasLocal || 0} - {firstMatch.carrerasVisitante || 0}
                                                </span>
                                                {finalRivalLogo?.src && (
                                                    <img
                                                        src={finalRivalLogo.src}
                                                        alt="Rival"
                                                        style={{ width: safeCrestSize * 0.75, height: safeCrestSize * 0.75, objectFit: "contain" }}
                                                    />
                                                )}
                                            </div>
                                        ) : firstMatch.logo?.src ? (
                                            <img
                                                src={firstMatch.logo.src}
                                                alt={firstMatch.opponent}
                                                style={{ width: safeCrestSize, height: safeCrestSize, objectFit: "contain" }}
                                            />
                                        ) : null}
                                    </div>
                                ) : (
                                    <div style={{ flex: 1 }} />
                                )}

                                {hasMatchInCurrentMonth && (
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4, width: "100%" }}>
                                        <span style={{ ...matchDataFont, fontSize: 10, textTransform: "uppercase" }}>
                                            {isLocal ? vsLabel : isFinished ? finishedLabel : enLabel} {showOpponentName && !isFinished ? firstMatch.opponent : ""}
                                        </span>
                                        <span style={{ ...matchDataFont, fontSize: 10, color: isFinished ? "#FFFFFF" : isLocal ? "#111111" : mutedTextColor }}>
                                            {!isFinished ? firstMatch.time : ""}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )

                        const cellStyle: React.CSSProperties = {
                            borderRight: `1px solid ${lineColor}`,
                            borderBottom: `1px solid ${lineColor}`,
                            minHeight: safeCellMinHeight,
                            height: safeCellMinHeight,
                            background: dayCellBackground,
                            boxSizing: "border-box",
                            color: dayCellTextColor,
                        }

                        return firstMatch?.link && isCurrentMonth ? (
                            <a key={key} href={firstMatch.link} style={{ ...cellStyle, textDecoration: "none", display: "block" }}>
                                {cellInner}
                            </a>
                        ) : (
                            <div key={key} style={cellStyle}>
                                {cellInner}
                            </div>
                        )
                    })}
                </div>
            </div>

            {!monthHasMatches && (
                <div
                    style={{
                        border: `1px dashed ${lineColor}`,
                        padding: "12px",
                        textAlign: "center",
                        color: mutedTextColor,
                        textTransform: "uppercase",
                        ...dayHeaderFont,
                    }}
                >
                    {emptyStateText}
                </div>
            )}

            {showLegend && !isCompactMode && (
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        gap: 10,
                        borderTop: `1px solid ${lineColor}`,
                        paddingTop: 10,
                    }}
                >
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                background: accentLocalColor,
                                color: "#111111",
                                padding: "4px 8px",
                                textTransform: "uppercase",
                                ...matchDataFont,
                            }}
                        >
                            {localLabel}
                        </div>
                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                border: `1px solid ${lineColor}`,
                                background: visitorSurfaceColor,
                                color: textColor,
                                padding: "4px 8px",
                                textTransform: "uppercase",
                                ...matchDataFont,
                            }}
                        >
                            {visitorLabel}
                        </div>
                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                background: finishedTagColor,
                                color: textColor,
                                padding: "4px 8px",
                                textTransform: "uppercase",
                                ...matchDataFont,
                            }}
                        >
                            {finishedLabel}
                        </div>
                    </div>
                    <div style={{ color: mutedTextColor, textTransform: "uppercase", ...matchDataFont }}>
                        {timezoneNote}
                    </div>
                </div>
            )}
        </div>
    )
}

MatchCalendar.displayName = "Match Calendar"

addPropertyControls(MatchCalendar, {
    matches: {
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
                opponent: {
                    type: ControlType.String,
                    title: "Rival",
                    defaultValue: "Rebels",
                },
                logo: { type: ControlType.ResponsiveImage, title: "Escudo Local" },
                logoRivalFinal: {
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
                    title: "Puntos Visitante",
                    defaultValue: 0,
                    min: 0,
                    max: 99,
                    step: 1,
                },
                condition: {
                    type: ControlType.Enum,
                    title: "Condición",
                    options: ["local", "visitante", "finalizado"],
                    optionTitles: ["Local", "Visitante", "Finalizado"],
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
                opponent: "Rebels",
                condition: "local",
                link: "",
            },
        ],
    },
    initialMonth: {
        type: ControlType.Number,
        title: "Mes Inicial",
        defaultValue: 10,
        min: 1,
        max: 12,
        step: 1,
    },
    initialYear: {
        type: ControlType.Number,
        title: "Año Inicial",
        defaultValue: 2026,
        min: 1900,
        max: 2200,
        step: 1,
    },
    firstDayOfWeek: {
        type: ControlType.Enum,
        title: "Inicio de Semana",
        options: ["domingo", "lunes"],
        optionTitles: ["Domingo", "Lunes"],
        defaultValue: "domingo",
    },
    backgroundColor: {
        type: ControlType.Color,
        title: "Fondo",
        defaultValue: "#0A0B0C",
    },
    cellSurfaceColor: {
        type: ControlType.Color,
        title: "Fondo Celda",
        defaultValue: "#121212",
    },
    accentLocalColor: {
        type: ControlType.Color,
        title: "Acento Local",
        defaultValue: "#FF6B00",
    },
    visitorSurfaceColor: {
        type: ControlType.Color,
        title: "Superficie Visita",
        defaultValue: "rgba(255,255,255,0.08)",
    },
    textColor: {
        type: ControlType.Color,
        title: "Texto",
        defaultValue: "#FFFFFF",
    },
    mutedTextColor: {
        type: ControlType.Color,
        title: "Texto Tenue",
        defaultValue: "rgba(255,255,255,0.5)",
    },
    lineColor: {
        type: ControlType.Color,
        title: "Bordes",
        defaultValue: "rgba(255,255,255,0.15)",
    },
    cellMinHeight: {
        type: ControlType.Number,
        title: "Altura de Celda",
        defaultValue: 120,
        min: 56,
        max: 260,
        step: 2,
        unit: "px",
    },
    crestSize: {
        type: ControlType.Number,
        title: "Tamaño Escudo",
        defaultValue: 32,
        min: 18,
        max: 80,
        step: 1,
        unit: "px",
    },
    showWeekFilter: {
        type: ControlType.Boolean,
        title: "Filtro de Semanas",
        defaultValue: true,
    },
    showLegend: {
        type: ControlType.Boolean,
        title: "Mostrar Leyenda",
        defaultValue: true,
    },
    localLabel: {
        type: ControlType.String,
        title: "Etiqueta Local",
        defaultValue: "Local",
    },
    visitorLabel: {
        type: ControlType.String,
        title: "Etiqueta Visita",
        defaultValue: "Visitante",
    },
    finishedLabel: {
        type: ControlType.String,
        title: "Etiqueta Final",
        defaultValue: "Final",
    },
    timezoneNote: {
        type: ControlType.String,
        title: "Nota Horaria",
        defaultValue: "Horario de Querétaro (GMT-6)",
    },
    modo: {
        type: ControlType.Enum,
        title: "Modo",
        options: ["Completo", "Compacto"],
        optionTitles: ["Completo", "Compacto"],
        defaultValue: "Completo",
    },
})
