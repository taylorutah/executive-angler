#!/bin/bash
# Populates usgs_gauge_id with JSON gauge arrays for all US rivers
# Run once to seed the data

BASE="https://api.executiveangler.com/rest/v1/rivers"
KEY="sb_publishable_QjmDvT_LmyUeXJpL0NAfAA_1Tq0HDSi"
HEADERS=(-H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -H "Prefer: return=minimal")

update_river() {
  local id="$1"
  local gauges="$2"
  echo "Updating $id..."
  curl -s -o /dev/null -w "  → %{http_code}\n" -X PATCH \
    "$BASE?id=eq.$id" \
    "${HEADERS[@]}" \
    -d "{\"usgs_gauge_id\": $(echo "$gauges" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read().strip()))')}"
}

# Provo River (UT)
update_river "provo-river" '[{"site_id":"10154200","name":"Near Woodland","section":"Upper Provo"},{"site_id":"10155100","name":"Below Jordanelle Dam","section":"Middle Provo"},{"site_id":"10159500","name":"Below Deer Creek Dam","section":"Lower Provo"},{"site_id":"10163000","name":"At Provo","section":"Lower Provo (Canyon)"}]'

# Madison River (MT)
update_river "river-madison" '[{"site_id":"06038500","name":"Below Hebgen Lake","section":"Upper Madison (50-Mile Riffle)"},{"site_id":"06040000","name":"Near Cameron","section":"Middle Madison"},{"site_id":"06041000","name":"Below Ennis Lake","section":"Bear Trap Canyon"}]'

# Gallatin River (MT)
update_river "river-gallatin" '[{"site_id":"06043120","name":"Above Deer Creek (Big Sky)","section":"Upper Gallatin"},{"site_id":"06043500","name":"Near Gallatin Gateway","section":"Lower Canyon"}]'

# Yellowstone River (MT)
update_river "river-yellowstone" '[{"site_id":"06191500","name":"At Corwin Springs","section":"Upper (Paradise Valley)"},{"site_id":"06192500","name":"Near Livingston","section":"Middle (Livingston)"}]'

# Missouri River (MT)
update_river "river-missouri" '[{"site_id":"06065500","name":"Below Hauser Dam","section":"Hauser Tailwater"},{"site_id":"06066500","name":"Below Holter Dam","section":"Holter Tailwater (Craig)"},{"site_id":"06074000","name":"At Cascade","section":"Mid-Canyon"}]'

# Big Hole River (MT)
update_river "river-big-hole" '[{"site_id":"06024450","name":"At Wisdom","section":"Upper Big Hole"},{"site_id":"06024580","name":"Near Wise River","section":"Middle Big Hole"},{"site_id":"06025500","name":"Near Melrose","section":"Lower Big Hole"}]'

# Rock Creek (MT)
update_river "river-rock-creek" '[{"site_id":"12334510","name":"Near Clinton","section":"Rock Creek"}]'

# Snake River (WY)
update_river "river-snake-river" '[{"site_id":"13011000","name":"Near Moran","section":"Below Jackson Lake Dam"},{"site_id":"13013650","name":"At Moose","section":"Grand Teton (Moose-Wilson)"},{"site_id":"13022500","name":"Near Alpine","section":"Snake River Canyon"}]'

# North Platte River (WY)
update_river "river-north-platte-wy" '[{"site_id":"06642000","name":"At Alcova","section":"Miracle Mile"},{"site_id":"06643500","name":"Near Goose Egg","section":"Grey Reef"},{"site_id":"06652800","name":"Below Glendo Reservoir","section":"Glendo Tailwater"}]'

# Firehole River (YNP)
update_river "river-firehole" '[{"site_id":"06036805","name":"At Old Faithful","section":"Upper Firehole"},{"site_id":"06036905","name":"Near West Yellowstone","section":"Lower Firehole"}]'

# South Platte River (CO)
update_river "river-south-platte" '[{"site_id":"06700000","name":"Above Cheesman Lake","section":"Deckers"},{"site_id":"06701900","name":"Below Cheesman Dam","section":"Cheesman Canyon"}]'

# Arkansas River (CO)
update_river "river-arkansas-co" '[{"site_id":"07087200","name":"At Buena Vista","section":"Upper Arkansas"},{"site_id":"07094500","name":"At Parkdale","section":"Royal Gorge"},{"site_id":"07109500","name":"Below Pueblo Dam","section":"Pueblo Tailwater"}]'

# Frying Pan River (CO)
update_river "river-frying-pan" '[{"site_id":"09080400","name":"Near Ruedi","section":"Below Ruedi Dam"}]'

# Henry's Fork (ID)
update_river "river-henry-s-fork" '[{"site_id":"13041010","name":"Below Coffee Pot Rapids","section":"Box Canyon"},{"site_id":"13042500","name":"Near Island Park","section":"Harriman (Railroad Ranch)"},{"site_id":"13046000","name":"Near Ashton","section":"Lower Henrys Fork"}]'

# Silver Creek (ID)
update_river "river-silver-creek" '[{"site_id":"13150430","name":"At Sportsman Access","section":"Silver Creek Preserve"}]'

# South Fork Boise (ID)
update_river "river-south-fork-boise" '[{"site_id":"13190500","name":"At Anderson Ranch Dam","section":"Below Anderson Ranch Dam"},{"site_id":"13192200","name":"At Neal Bridge","section":"Lower South Fork"}]'

# Kenai River (AK)
update_river "river-kenai" '[{"site_id":"15258000","name":"At Cooper Landing","section":"Upper Kenai"},{"site_id":"15266110","name":"Below Skilak Lake","section":"Middle Kenai"},{"site_id":"15266300","name":"At Soldotna","section":"Lower Kenai"}]'

# Deschutes River (OR)
update_river "river-deschutes" '[{"site_id":"14056500","name":"Below Wickiup Reservoir","section":"Upper Deschutes"},{"site_id":"14092500","name":"Near Madras","section":"Lower Deschutes"},{"site_id":"14103000","name":"At Moody near Biggs","section":"Lower Deschutes (Mouth)"}]'

# Rogue River (OR)
update_river "river-rogue" '[{"site_id":"14335072","name":"At Cole Rivers Hatchery","section":"Holy Water (Below Lost Creek Dam)"},{"site_id":"14339000","name":"At Dodge Bridge","section":"Middle Rogue"},{"site_id":"14361500","name":"At Grants Pass","section":"Lower Rogue"}]'

# McKenzie River (OR)
update_river "river-mckenzie" '[{"site_id":"14158850","name":"Below Trail Bridge Dam","section":"Upper McKenzie"},{"site_id":"14162500","name":"Near Vida","section":"Middle McKenzie"},{"site_id":"14163150","name":"Below Leaburg Dam","section":"Lower McKenzie"}]'

# Letort Spring Run (PA)
update_river "river-letort-spring-run" '[{"site_id":"01569800","name":"Near Carlisle","section":"Letort Spring Run"}]'

# Big Spring Creek (MT)
update_river "river-big-spring" '[{"site_id":"06111800","name":"Near Lewistown","section":"Big Spring Creek"}]'

# Penns Creek (PA)
update_river "river-penns-creek" '[{"site_id":"01555000","name":"At Penns Creek","section":"Penns Creek"}]'

# Au Sable River (MI)
update_river "river-au-sable" '[{"site_id":"04135500","name":"At Grayling","section":"Holy Waters"},{"site_id":"04135700","name":"South Branch near Luzerne","section":"South Branch (Mason Tract)"},{"site_id":"04136500","name":"At Mio","section":"Below Mio Dam"}]'

# Pere Marquette River (MI)
update_river "river-pere-marquette" '[{"site_id":"04122500","name":"At Scottville","section":"Pere Marquette River"}]'

# Manistee River (MI)
update_river "river-manistee" '[{"site_id":"04123500","name":"Near Grayling","section":"Upper Manistee"},{"site_id":"04124200","name":"Near Mesick","section":"Above Tippy Dam"},{"site_id":"04125550","name":"Near Wellston","section":"Below Tippy Dam"}]'

# White River (AR)
update_river "river-white-river-ar" '[{"site_id":"07057370","name":"Near Norfork","section":"Below Bull Shoals Dam"},{"site_id":"07060500","name":"At Calico Rock","section":"Middle Tailwater"}]'

# Norfork River (AR)
update_river "river-norfork" '[{"site_id":"07057370","name":"White River near Norfork","section":"Norfork Tailwater Area"}]'

# Little Red River (AR)
update_river "river-little-red" '[{"site_id":"07076000","name":"Near Heber Springs","section":"Below Greers Ferry Dam"},{"site_id":"07076517","name":"Near Dewey","section":"Lower Tailwater"}]'

# Copper River (AK)
update_river "river-copper-river" '[{"site_id":"15214000","name":"At Million Dollar Bridge","section":"Lower Copper River"}]'

echo ""
echo "Done! All 29 US rivers updated with USGS gauge data."
