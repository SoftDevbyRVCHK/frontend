let eccentricity;
let meanAnomaly;

function halleyMethod(f, x0, tol = Math.pow(10, -7), maxIter = 1000) {
  for (let i = 0; i < maxIter; i++) {
    const fx = f[0](x0);
//    console.log(fx, x0, f, f[0], f[0](0));
//    return
    if (Math.abs(fx) < tol) return x0;
    const fPrime = f[1](x0); // Нужно реализовать или взять готовую
    const fSecond = f[2](x0); // Для второй производной
    const a = fPrime;
    const b = fSecond;
    const xNext = x0 - (fx * fPrime) / (fPrime * fPrime - 0.5 * fx * fSecond);
    x0 = xNext;
  }
  throw new Error("Method failed to converge");
}


function SolveKeplerEquation(meanAnomaly, eccentricity) {
    return halleyMethod([(x) => {return x - meanAnomaly - eccentricity * Math.sin(x)}, (x) => {return 1 - eccentricity * Math.cos(x)}, (x) => {return eccentricity * Math.sin(x)}], meanAnomaly-eccentricity);
}


function EccentricityAnomaly(eccentricity, meanMotion, start_time, time)
{
    return SolveKeplerEquation(MeanAnomaly(time, meanMotion, start_time), eccentricity);
}

function MeanAnomaly(time, meanMotion, start_time)
{
    anomaly = 2 * 3.14 * meanMotion * (time - start_time);
    wrappedAnomaly = anomaly % 6.28;
    return wrappedAnomaly;
}

function TrueAnomaly(eccentricity, eccentricityAnomaly)
{
    // Тангенс половинчатого угла
    tg_v_2 = Math.sqrt((1 + eccentricity) / (1 - eccentricity)) * Math.tan(eccentricityAnomaly / 2);
    // Половинчатый угол
    v_2 = Math.atan(tg_v_2);
    // Истинная аномалия
    return v_2 + v_2;
}

function RadiusVectorLength(largeAxis, eccentricity, eccentricityAnomaly)
{
    return largeAxis * (1 - eccentricity * Math.cos(eccentricityAnomaly));
}

function PlanetPosition2D(large_axis, eccentricity, meanMotion, start_time, time)
{
    e = EccentricityAnomaly(eccentricity, meanMotion, start_time, time);
    r = RadiusVectorLength(large_axis, eccentricity, e);
    v = TrueAnomaly(eccentricity, e);
    return { x:r * Math.cos(v), y:r * Math.sin(v) };
}