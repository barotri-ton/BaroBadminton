# Shuttlecock Physics Specification

Use SI units, fixed dt=1/120 s, gravity 9.81 m/s², drag force approximated as Fd=-0.5*rho*Cd*A*|v|*v with orientation-dependent coefficient. Calibrate feather and nylon separately using documented estimates. Do not represent estimated coefficients as laboratory measurements.

Deterministic tests must cover launch trajectories, net crossings, landing and reproducibility. Physics implementation is pending.
