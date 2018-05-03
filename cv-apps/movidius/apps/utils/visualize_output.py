#!/usr/bin/python3

# ****************************************************************************
# Copyright(c) 2017 Intel Corporation. 
# License: MIT See LICENSE file in root directory.
# ****************************************************************************

# Utilities to help visualize the output from
# Intel® Movidius™ Neural Compute Stick (NCS) 

import numpy
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import fontconfig

def draw_bounding_box( y1, x1, y2, x2, 
                       img, 
                       thickness=4, 
                       fontsize=15,
                       outlineColor=(255, 255, 0),
                       textColor=(255, 255, 0),
                       display_str=() ):

    """ Inputs
    (x1, y1)  = Top left corner of the bounding box
    (x2, y2)  = Bottom right corner of the bounding box
    img       = Image/frame represented as numpy array
    thickness = Thickness of the bounding box's outline
    outlineColor     = Color of the bounding box's outline
    textColor = Color of the text to draw
    fontsize  = Font size 
    """

    img = Image.fromarray( img )
    draw = ImageDraw.Draw( img )

    for x in range( 0, thickness ):
            draw.rectangle( [(x1-x, y1-x), (x2-x, y2-x)], outline=outlineColor )
    fonts = fontconfig.query(family='FreeSerif', lang='en')
    for i in range(1, len(fonts)):
      if fonts[i].fontformat == 'TrueType':
        for j in range(1,len(fonts[i].style)):
          if fonts[i].style[j][1] == 'Regular':
            absolute_path = fonts[i].file
            break;
    try:
      absolute_path
    except NameError:
        font = ImageFont.load_default()
    else:
      font = ImageFont.truetype(absolute_path, fontsize)

    draw.text( (x1, y1), display_str, font=font, fill=textColor )

    return numpy.array( img )

# ==== End of file ===========================================================
