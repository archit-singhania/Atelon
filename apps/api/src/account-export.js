// Explicit projections prevent invitation secrets and future private columns from
// accidentally becoming part of a downloadable account archive.
const inventory = [
 ['profiles','id','id,display_name,avatar_url,preferences,created_at,updated_at','id'],
 ['collections','user_id','id,name,visibility,vehicle_slugs,notes,created_at,updated_at','id'],
 ['comparisons','user_id','id,name,vehicle_slugs,unit_preference,created_at,updated_at','id'],
 ['threads','user_id','id,title,messages,created_at,updated_at','id'],
 ['recent_views','user_id','vehicle_slug,viewed_at','vehicle_slug'],
 ['research_state','user_id','state,updated_at','user_id'],
 ['research_rooms','owner_id','id,state,version,created_at,updated_at','id'],
 ['room_members','user_id','room_id,created_at','room_id'],
 ['room_notes','user_id','id,room_id,text,created_at','id'],
 ['contributions','user_id','id,vehicle_slug,kind,proposal,source_url,status,review_note,created_at,updated_at','id'],
 ['suggestions','user_id','id,vehicle,reason,source_url,status,created_at','id']
];

export async function exportCloudAccount(cloud, user) {
 if(!user?.id)throw Object.assign(new Error('Sign in to export account data.'),{statusCode:401});
 const result={};let bytes=0;
 for(const [table,column,fields,order] of inventory){
  const records=[];let offset=0;
  for(;;){
   const {data,error}=await cloud.from(table).select(fields).eq(column,user.id).order(order,{ascending:true}).range(offset,offset+499);
   if(error)throw Object.assign(new Error('Account export could not finish. No complete archive was produced; retry later.'),{statusCode:503});
   if(!Array.isArray(data))throw Object.assign(new Error('Invalid account export response.'),{statusCode:503});
   if(!data.length)break;
   bytes+=Buffer.byteLength(JSON.stringify(data));offset+=data.length;
   if(offset>50000||bytes>20*1024*1024)throw Object.assign(new Error('Account export exceeds the inline archive limit. A larger export requires an operator-assisted download.'),{statusCode:413});
   records.push(...data);
  }
  if(table==='research_state')result.research=records[0]||null;
  else result[table]=records;
 }
 return result;
}
