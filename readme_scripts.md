Scripts:
    1. create_empty_map - Creates an empty map based on maps object in map_config, also updates height and width based on number and length of maps, bridge and coming soon. Empty map will be stored in map_empty.

    2. duplicate_map - Stiches map files together, adds spacing for bridges and coming_soon. It will take map_data for each map number from a file in maps folder. If the map file doesn't exist, say map1.json doesn't exist, it will instead take the same values for the milestones at a similar row from the origianl_map.js.

    3. map_config - This has config values like width, height of the map. Comingsoon shows the length of comingsoon and bridge. Maps object is used to define the length of each map and how many times it's repeated.

    When creating a map for placing milestones, the length property for comingsoon and bridge should be 0, and only 1 map of some length and repeat as 1.

Files:
    1. maps/original_map.js - The js file  that is compied from the already map data in the game,  will be used to populate the map in case a maps json file doesn't exist.

    2. maps/map[1,2,3,4...].json - Files that have a single map element. This is what will be repeated and duplicated by duplicate_map.

    3. maps/map_empty.js - The empty map that is created when create_empty_map is run. It is created according to map_config objects. Duplicate map uses the structure in this file to stitch maps and bridges. 

    4. maps/final_map.js - The final map output from duplicate_map when all map data has been repeated and stiched.

Functions in duplicate_map:
    1. Duplicate map placing comingsoon on top and then loops through empty_map, going bottom up as it takes each tile data from either the original map or loop_data(which is the single map json files that we create initially after placing milestones on them), numbering them in reverse. 

    Once a particular map repeat is done it will put in a bridge in the tile_config and the map based on the length given in map_config before working on the next set of repeated maps.

    - create_map_group: Creates a single map instance(no repeat) from map[1,2,3,...].json. If it detects an object(Which means it is a milestone) it adds it to tiles array. It runs create_object on all the values in tiles array after they are sorted according to y position and reversed(Since we are traversing downwards) which creates the correct milestone paramenters.

    - create_object: Creates a milestone object by adding properties like node, id(number placement). tags. etc

    - create_orig_map: If a map[1,2,3...].json file is not found, duplicate_map will replace the (length X repeat) no. of rows from orig_data. This works for the entire repeating map as defined in the map_config unlike create_map_group which runs for each iteration of the repeat.

To add a map/s:
    1. Create tiling using devkithelper scripts.

    2. Replace the tiling in the game for a single map.

    3. Create an empty map of desired length(Probably 20), run create empty map with map_config file looking like:

      "maps": [

        {

          "length": 20,

          "repeat": 1

        }

      ]

      and coming_soon and bridge havig a length of 0

    4. copy the resulting empty_map to map_data in the game, modify src/adventuremap/tile.js with map name as the name of the map images you are placing (a folder in resources/tiles should already be there from step 1). Change the height of the map in src/adventuremap/grid.js.

    5. Turn on edit mode in adventure map and create and place milestones in map editor for a single iteration on the map.

    6. Once it is exported, create a map[number].json in the maps file.

    7. Steps 3-6 will be repeated based on the number of maps to be added. 

    8. Modify the config to how a fully created map should look (with bridge and comingsoon lengths and the correct repeat values)

    9. Copy the original map data to maps/original_map.js

    10. Run duplicate_map script which will give you a final_map

    11. Replace map data in game with final_map

    12. The tile config (To be replaced in src/adventuremap/tile.js -> maps) will be shwn as a console log when script has finished running. You will need to rename the proper folder properties since right now they are generated serially but they can repeat.

    Change the height of the map in src/adventuremap/grid.js.

Inserting a map in between can only be done when we have the map objectss for all the maps above the map in question because placing on the original map can be at different positions irrespective of just the height gap.