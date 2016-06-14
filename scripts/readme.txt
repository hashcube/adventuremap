To modify a node positions:
  1. Set height in map_config to length + 1, with a single object in maps with repeat

  2.Run create_empty_map and replace the resources/data/ file with the resulting js file(empty_map.js).

  3.Position the milestones and copy the export to a json file in scripts/maps for the selected map.

  4. Run create empty map with the correct height and width for the overall map

  5.Run duplicate map after setting the correct values again in map_config.


To add a map:
  1. Do the same as above till step 3 for the new map

  2.add the map to the maps object and create a new json file in map

  3. Run create empty map with the correct height and width for the overall map

  4.Run duplicate map after setting the correct values again in map_config.
