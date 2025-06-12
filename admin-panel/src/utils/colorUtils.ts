// Utility funktiot värien käsittelyyn
export const getTailwindTextColor = (color: string, shade: number = 300): string => {
  const validColors = [
    'gray', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 
    'emerald', 'cyan', 'blue', 'violet', 'purple', 'pink', 'rose'
  ];
  
  // Varmista että väri on kelvollinen
  const validColor = validColors.includes(color) ? color : 'gray';
  return `text-${validColor}-${shade}`;
};

export const getTailwindBgColor = (color: string, shade: number = 500): string => {
  const validColors = [
    'gray', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 
    'emerald', 'cyan', 'blue', 'violet', 'purple', 'pink', 'rose'
  ];
  
  // Varmista että väri on kelvollinen
  const validColor = validColors.includes(color) ? color : 'gray';
  return `bg-${validColor}-${shade}`;
};

// Mapping funktio täydellisille luokkanimille (varmistaa että Tailwind löytää ne)
export const getCalendarIconColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    gray: 'text-gray-300',
    red: 'text-red-300',
    orange: 'text-orange-300',
    amber: 'text-amber-300',
    yellow: 'text-yellow-300',
    lime: 'text-lime-300',
    green: 'text-green-300',
    emerald: 'text-emerald-300',
    cyan: 'text-cyan-300',
    blue: 'text-blue-300',
    violet: 'text-violet-300',
    purple: 'text-purple-300',
    pink: 'text-pink-300',
    rose: 'text-rose-300',
  };
  
  return colorMap[color] || 'text-gray-300';
};

export const getCalendarBadgeColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    gray: 'bg-gray-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    amber: 'bg-amber-500',
    yellow: 'bg-yellow-500',
    lime: 'bg-lime-500',
    green: 'bg-green-500',
    emerald: 'bg-emerald-500',
    cyan: 'bg-cyan-500',
    blue: 'bg-blue-500',
    violet: 'bg-violet-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    rose: 'bg-rose-500',
  };
  
  return colorMap[color] || 'bg-gray-500';
};