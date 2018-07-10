Tags are stored wrt releases

To modify node positions:
  1. Run create_empty_map and pass the map number of the map you want to create

  2. Modify src adventuremap/grid.js, adventuremap/tilejs for the length of just one map.

  3. Replace the resources/data/ file with the resulting js file(empty_map.js).

  4. Position the milestones and copy the export to a json file in scripts/maps for the selected map.

  5. Run duplicate map.

  6. Copy final_map to map tiles and tile_config as the maps config for tile.js

To add a map:
  1. Copy exciting map as original map in maps folder

  2. Copy exciting tile_config to tile_config file inside maps folder

  3. Create a folder named 'new_maps' and copy the new individual maps

  4. Run add_new_map script replace the output in game

Parameters:

create_empty_map <1> <2> <3>
  <1> optional map id (for specific map data reading)
  <2> location to dump map_empty file. default: adventuremap/scripts/maps/map_empty.js
  <3> location to map export config. default: adventuremap/scripts/map_config.json

duplicate_map <1> <2> <3> (This scrip should be run from scripts folder)
  <1> folder location to read map files. default: adventuremap/scripts/maps/
  <2> name of the file to dump the computed map, if empty will dump
    at adventuremap/scripts/maps/final_map.js
  <3> location to map export config. default: adventuremap/scripts/map_config.json

add_new_map <1> <2> <3> (This scrip should be run from scripts folder)
  <1> new max_ms (Mandatory)
  <2> no of rpeats of individual maps (default is 1)
  <3> add chapters or not (1 for enabling, defalt is 0)
