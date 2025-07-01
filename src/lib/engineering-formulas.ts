import { EngineeringFormula, EngineeringCategory } from '@/types/engineering'

export const engineeringFormulas: EngineeringFormula[] = [
  // Mechanical Engineering
  {
    id: 'motor-rpm-to-linear-speed',
    name: 'Motor RPM to Linear Speed',
    formula: 'v = (π * D * RPM) / 60',
    description: 'Convert motor RPM to linear speed using wheel/pulley diameter',
    category: 'mechanical',
    variables: [
      { symbol: 'v', name: 'Linear Speed', description: 'Linear velocity', unit: 'm/s' },
      { symbol: 'D', name: 'Diameter', description: 'Wheel or pulley diameter', unit: 'm' },
      { symbol: 'RPM', name: 'Rotational Speed', description: 'Revolutions per minute', unit: 'rpm' }
    ],
    units: [
      { system: 'metric', baseUnit: 'm/s', conversions: { 'ft/min': 196.85, 'km/h': 3.6 } },
      { system: 'imperial', baseUnit: 'ft/min', conversions: { 'm/s': 0.00508, 'mph': 0.0114 } }
    ],
    examples: [
      {
        description: 'Motor at 1800 RPM with 0.1m diameter wheel',
        inputs: { RPM: 1800, D: 0.1 },
        expectedOutput: 9.42,
        outputUnit: 'm/s'
      }
    ],
    tags: ['motor', 'rpm', 'speed', 'mechanical', 'rotation']
  },
  {
    id: 'rpm-to-fpm',
    name: 'RPM to Feet Per Minute',
    formula: 'FPM = (π * D_ft * RPM)',
    description: 'Convert RPM to feet per minute using diameter in feet',
    category: 'mechanical',
    variables: [
      { symbol: 'FPM', name: 'Feet Per Minute', description: 'Linear speed in ft/min', unit: 'ft/min' },
      { symbol: 'D_ft', name: 'Diameter (feet)', description: 'Diameter in feet', unit: 'ft' },
      { symbol: 'RPM', name: 'RPM', description: 'Revolutions per minute', unit: 'rpm' }
    ],
    units: [
      { system: 'imperial', baseUnit: 'ft/min', conversions: { 'm/s': 0.00508, 'mph': 0.0114 } }
    ],
    examples: [
      {
        description: 'Motor at 1750 RPM with 6 inch (0.5 ft) pulley',
        inputs: { RPM: 1750, D_ft: 0.5 },
        expectedOutput: 2749,
        outputUnit: 'ft/min'
      }
    ],
    tags: ['rpm', 'fpm', 'pulley', 'belt', 'conveyor']
  },
  {
    id: 'torque-power-rpm',
    name: 'Power from Torque and RPM',
    formula: 'P = (T * RPM) / 5252',
    description: 'Calculate horsepower from torque (lb-ft) and RPM',
    category: 'mechanical',
    variables: [
      { symbol: 'P', name: 'Power', description: 'Power output', unit: 'hp' },
      { symbol: 'T', name: 'Torque', description: 'Torque in pound-feet', unit: 'lb-ft' },
      { symbol: 'RPM', name: 'RPM', description: 'Revolutions per minute', unit: 'rpm' }
    ],
    units: [
      { system: 'imperial', baseUnit: 'hp', conversions: { 'kW': 0.746, 'W': 746 } }
    ],
    examples: [
      {
        description: 'Motor producing 100 lb-ft at 1800 RPM',
        inputs: { T: 100, RPM: 1800 },
        expectedOutput: 34.3,
        outputUnit: 'hp'
      }
    ],
    tags: ['torque', 'power', 'horsepower', 'motor']
  },
  {
    id: 'belt-ratio',
    name: 'Belt Drive Ratio',
    formula: 'ratio = D2 / D1 = RPM1 / RPM2',
    description: 'Calculate speed ratio between driving and driven pulleys',
    category: 'mechanical',
    variables: [
      { symbol: 'ratio', name: 'Speed Ratio', description: 'Ratio of speeds', unit: 'dimensionless' },
      { symbol: 'D1', name: 'Drive Pulley Diameter', description: 'Driving pulley diameter', unit: 'in' },
      { symbol: 'D2', name: 'Driven Pulley Diameter', description: 'Driven pulley diameter', unit: 'in' },
      { symbol: 'RPM1', name: 'Drive RPM', description: 'Driving pulley RPM', unit: 'rpm' },
      { symbol: 'RPM2', name: 'Driven RPM', description: 'Driven pulley RPM', unit: 'rpm' }
    ],
    units: [
      { system: 'both', baseUnit: 'dimensionless', conversions: {} }
    ],
    examples: [
      {
        description: '6 inch drive pulley to 12 inch driven pulley',
        inputs: { D1: 6, D2: 12 },
        expectedOutput: 2,
        outputUnit: 'ratio'
      }
    ],
    tags: ['belt', 'pulley', 'ratio', 'gear', 'transmission']
  },
  
  // Electrical Engineering
  {
    id: 'ohms-law-voltage',
    name: 'Ohm\'s Law - Voltage',
    formula: 'V = I * R',
    description: 'Calculate voltage from current and resistance',
    category: 'electrical',
    variables: [
      { symbol: 'V', name: 'Voltage', description: 'Electrical potential difference', unit: 'V' },
      { symbol: 'I', name: 'Current', description: 'Electric current', unit: 'A' },
      { symbol: 'R', name: 'Resistance', description: 'Electrical resistance', unit: 'Ω' }
    ],
    units: [
      { system: 'both', baseUnit: 'V', conversions: { 'kV': 0.001, 'mV': 1000 } }
    ],
    examples: [
      {
        description: '5 amperes through 10 ohm resistor',
        inputs: { I: 5, R: 10 },
        expectedOutput: 50,
        outputUnit: 'V'
      }
    ],
    tags: ['ohm', 'voltage', 'current', 'resistance', 'electrical']
  },
  {
    id: 'electrical-power',
    name: 'Electrical Power',
    formula: 'P = V * I',
    description: 'Calculate electrical power from voltage and current',
    category: 'electrical',
    variables: [
      { symbol: 'P', name: 'Power', description: 'Electrical power', unit: 'W' },
      { symbol: 'V', name: 'Voltage', description: 'Voltage', unit: 'V' },
      { symbol: 'I', name: 'Current', description: 'Current', unit: 'A' }
    ],
    units: [
      { system: 'both', baseUnit: 'W', conversions: { 'kW': 0.001, 'hp': 0.00134, 'MW': 0.000001 } }
    ],
    examples: [
      {
        description: '120V circuit with 10A current',
        inputs: { V: 120, I: 10 },
        expectedOutput: 1200,
        outputUnit: 'W'
      }
    ],
    tags: ['power', 'voltage', 'current', 'electrical', 'watt']
  },
  {
    id: 'motor-efficiency',
    name: 'Motor Efficiency',
    formula: 'η = (P_out / P_in) * 100',
    description: 'Calculate motor efficiency percentage',
    category: 'electrical',
    variables: [
      { symbol: 'η', name: 'Efficiency', description: 'Motor efficiency', unit: '%' },
      { symbol: 'P_out', name: 'Output Power', description: 'Mechanical power output', unit: 'W' },
      { symbol: 'P_in', name: 'Input Power', description: 'Electrical power input', unit: 'W' }
    ],
    units: [
      { system: 'both', baseUnit: '%', conversions: { 'decimal': 0.01 } }
    ],
    examples: [
      {
        description: 'Motor with 750W output and 850W input',
        inputs: { P_out: 750, P_in: 850 },
        expectedOutput: 88.2,
        outputUnit: '%'
      }
    ],
    tags: ['efficiency', 'motor', 'power', 'electrical']
  },

  // Fluid Dynamics
  {
    id: 'flow-rate-pipe',
    name: 'Flow Rate in Pipe',
    formula: 'Q = A * v = π * (D/2)² * v',
    description: 'Calculate volumetric flow rate in a pipe',
    category: 'fluid_dynamics',
    variables: [
      { symbol: 'Q', name: 'Flow Rate', description: 'Volumetric flow rate', unit: 'm³/s' },
      { symbol: 'A', name: 'Area', description: 'Cross-sectional area', unit: 'm²' },
      { symbol: 'v', name: 'Velocity', description: 'Fluid velocity', unit: 'm/s' },
      { symbol: 'D', name: 'Diameter', description: 'Pipe diameter', unit: 'm' }
    ],
    units: [
      { system: 'metric', baseUnit: 'm³/s', conversions: { 'L/min': 60000, 'gpm': 15850 } },
      { system: 'imperial', baseUnit: 'gpm', conversions: { 'm³/s': 0.0000631, 'ft³/s': 0.00223 } }
    ],
    examples: [
      {
        description: '0.1m diameter pipe with 2 m/s velocity',
        inputs: { D: 0.1, v: 2 },
        expectedOutput: 0.0157,
        outputUnit: 'm³/s'
      }
    ],
    tags: ['flow', 'pipe', 'velocity', 'fluid', 'volume']
  },

  // Structural Engineering
  {
    id: 'beam-moment',
    name: 'Simply Supported Beam Moment',
    formula: 'M = (w * L²) / 8',
    description: 'Maximum moment in simply supported beam with uniform load',
    category: 'structural',
    variables: [
      { symbol: 'M', name: 'Moment', description: 'Bending moment', unit: 'N⋅m' },
      { symbol: 'w', name: 'Load', description: 'Uniform distributed load', unit: 'N/m' },
      { symbol: 'L', name: 'Length', description: 'Beam span length', unit: 'm' }
    ],
    units: [
      { system: 'metric', baseUnit: 'N⋅m', conversions: { 'kN⋅m': 0.001, 'lb⋅ft': 0.738 } },
      { system: 'imperial', baseUnit: 'lb⋅ft', conversions: { 'N⋅m': 1.356, 'kip⋅ft': 0.001 } }
    ],
    examples: [
      {
        description: '5m beam with 1000 N/m uniform load',
        inputs: { w: 1000, L: 5 },
        expectedOutput: 3125,
        outputUnit: 'N⋅m'
      }
    ],
    tags: ['beam', 'moment', 'structural', 'load', 'bending']
  },

  // Thermodynamics
  {
    id: 'heat-transfer-conduction',
    name: 'Heat Conduction',
    formula: 'q = k * A * (T1 - T2) / L',
    description: 'Heat transfer rate through conduction',
    category: 'thermodynamics',
    variables: [
      { symbol: 'q', name: 'Heat Rate', description: 'Heat transfer rate', unit: 'W' },
      { symbol: 'k', name: 'Thermal Conductivity', description: 'Material thermal conductivity', unit: 'W/(m⋅K)' },
      { symbol: 'A', name: 'Area', description: 'Heat transfer area', unit: 'm²' },
      { symbol: 'T1', name: 'Hot Temperature', description: 'Higher temperature', unit: 'K' },
      { symbol: 'T2', name: 'Cold Temperature', description: 'Lower temperature', unit: 'K' },
      { symbol: 'L', name: 'Thickness', description: 'Material thickness', unit: 'm' }
    ],
    units: [
      { system: 'metric', baseUnit: 'W', conversions: { 'kW': 0.001, 'BTU/hr': 3.412 } }
    ],
    examples: [
      {
        description: 'Steel wall 0.01m thick, 1m², k=50 W/(m⋅K), ΔT=100K',
        inputs: { k: 50, A: 1, T1: 373, T2: 273, L: 0.01 },
        expectedOutput: 500000,
        outputUnit: 'W'
      }
    ],
    tags: ['heat', 'conduction', 'thermal', 'temperature']
  }
]

export function getFormulasByCategory(category: EngineeringCategory): EngineeringFormula[] {
  return engineeringFormulas.filter(formula => formula.category === category)
}

export function searchFormulas(query: string): EngineeringFormula[] {
  const lowerQuery = query.toLowerCase()
  return engineeringFormulas.filter(formula => 
    formula.name.toLowerCase().includes(lowerQuery) ||
    formula.description.toLowerCase().includes(lowerQuery) ||
    formula.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    formula.variables.some(variable => 
      variable.name.toLowerCase().includes(lowerQuery) ||
      variable.description.toLowerCase().includes(lowerQuery)
    )
  )
}

export function getFormulaById(id: string): EngineeringFormula | undefined {
  return engineeringFormulas.find(formula => formula.id === id)
}