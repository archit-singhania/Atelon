import type { Vehicle } from '../types';
export function editorial(vehicle: Vehicle) {
  const accents:Record<string,string>={'delorean-dmc-12-time-machine':'#c4d5df','gmc-sierra-1500-at4x':'#aebd9a','lamborghini-countach-5000qv':'#e3c17b','mahindra-thar-4x4':'#ccac85','mazda-furai':'#df9d9e','nissan-skyline-r34-brians':'#90b8f4','plymouth-hemi-cuda-1971':'#c5a3dc','porsche-911-carrera-4s':'#a8ccc6','porsche-911-930-turbo-1975':'#d6bc96'};
  const classic = vehicle.years[0] < 1990;
  const utility = /thar|sierra/i.test(vehicle.slug);
  return { accent: accents[vehicle.slug] || '#95c9e5',
    chapter: utility ? 'Purpose in every proportion' : classic ? 'An era, expressed in metal' : 'The shape of ambition',
    collection: utility ? 'Beyond the boulevard' : classic ? 'Design through time' : 'Modern performance' };
}
