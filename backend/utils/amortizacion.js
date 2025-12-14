function addPeriod(date, freqCanon) {
    const d = new Date(date);

    if (freqCanon === "DIARIA") {
        d.setDate(d.getDate() + 1);
        return d;
    }
    if (freqCanon === "SEMANAL") {
        d.setDate(d.getDate() + 7);
        return d;
    }
    if (freqCanon === "QUINCENAL") {
        d.setDate(d.getDate() + 15);
        return d;
    }
    if (freqCanon === "MENSUAL") {
        d.setMonth(d.getMonth() + 1);
        return d;
    }

    throw new Error(`Frecuencia canónica inválida: ${freqCanon}`);
}

function periodsPerYear(freqCanon) {
    // Convención estándar (ajustable luego)
    if (freqCanon === "DIARIA") return 360;
    if (freqCanon === "SEMANAL") return 52;
    if (freqCanon === "QUINCENAL") return 24;
    if (freqCanon === "MENSUAL") return 12;
    throw new Error(`Frecuencia canónica inválida: ${freqCanon}`);
}

function round2(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function buildAmortizacion({
    principal,
    annualRate,    // 0.12
    nCuotas,
    freqCanon,     // DIARIA|SEMANAL|...
    startDate,     // fechaDesembolso
}) {
    const ppy = periodsPerYear(freqCanon);
    const r = annualRate / ppy; // tasa por periodo

    // cuota fija (si r=0, cuota = principal/n)
    let cuota;
    if (r === 0) {
        cuota = principal / nCuotas;
    } else {
        cuota = (principal * r) / (1 - Math.pow(1 + r, -nCuotas));
    }
    cuota = round2(cuota);

    let saldo = principal;
    let fecha = new Date(startDate);

    const items = [];

    for (let i = 1; i <= nCuotas; i++) {
        const interes = round2(saldo * r);
        let capital = round2(cuota - interes);

        // Ajuste final por redondeo para cerrar saldo en 0
        if (i === nCuotas) {
            capital = round2(saldo);
        }

        saldo = round2(saldo - capital);

        fecha = addPeriod(fecha, freqCanon);

        items.push({
            numeroCuota: i,
            fechaProgramada: fecha,
            cuota,                 // útil para UI
            capital,
            interes,
            mora: 0,
            saldoCapital: saldo,
            estadoCuota: "PENDIENTE",
        });
    }

    return { cuota, items };
}
