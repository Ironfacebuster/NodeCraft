const fs = require('fs')

//Loop over 16x16x16 sections in the 16x256x16 chunk
for (var i = 0; i < 16; i++) {
    //If the bitmask indicates this chunk has been sent...
    if (bitmask & 1 << i) {
        //Read data...
        cubic_chunk_data = io.read(4096); //2048 for the other arrays, where you'll need to split the data

        for (var j = 0; j < len(cubic_chunk_data); j++) {
            //Retrieve x,y,z and data from each element in cubic_chunk_array

            //Byte arrays
            x = chunk_x * 16 + j & 0x0F;
            y = i * 16 + j >> 8;
            z = chunk_z * 16 + (j & 0xF0) >> 4;
            data = cubic_chunk_data[j]

            //Nibble arrays
            data1 = cubic_chunk_data[j] & 0x0F;
            data2 = cubic_chunk_data[j] >> 4;

            k = 2 * j;
            x1 = chunk_x * 16 + k & 0x0F;
            y1 = i * 16 + k >> 8;
            z1 = chunk_z * 16 + (k & 0xF0) >> 4;

            k++;
            x2 = chunk_x * 16 + k & 0x0F;
            y2 = i * 16 + k >> 8;
            z2 = chunk_z * 16 + (k & 0xF0) >> 4;
        }
    }
}