#!/usr/bin/python3

# ****************************************************************************
# Copyright(c) 2017 Intel Corporation. 
# License: MIT See LICENSE file in root directory.
# ****************************************************************************

# Detect objects on a LIVE camera feed using
# Intel® Movidius™ Neural Compute Stick (NCS)

import os
import cv2
import sys
import numpy
import ntpath
import argparse
import socket
import mvnc.mvncapi as mvnc

import sys

from utils import visualize_output
from utils import deserialize_output
from utils import video_recorder as vr

# Detection threshold: Minimum confidance to tag as valid detection
CONFIDANCE_THRESHOLD = 0.60 # 60% confidant

# Variable to store commandline arguments
ARGS                 = None

# OpenCV object for video capture
camera               = None

FRAME_WIDTH = 400
FRAME_HEIGHT = 225

HOST = "127.0.0.1"
PORT = 7000

# ---- Step 1: Open the enumerated device and get a handle to it -------------

def open_ncs_device():

    # Look for enumerated NCS device(s); quit program if none found.
    devices = mvnc.EnumerateDevices()
    if len( devices ) == 0:
        print( "No devices found" )
        quit()

    # Get a handle to the first enumerated device and open it
    device = mvnc.Device( devices[0] )
    device.OpenDevice()

    return device

# ---- Step 2: Load a graph file onto the NCS device -------------------------

def load_graph( device ):

    # Read the graph file into a buffer
    with open( ARGS.graph, mode='rb' ) as f:
        blob = f.read()

    # Load the graph buffer into the NCS
    graph = device.AllocateGraph( blob )

    return graph

# ---- Step 3: Pre-process the images ----------------------------------------

def pre_process_image( frame ):

    # Resize image [Image size is defined by choosen network, during training]
    dim = ARGS.dim.split("x")
    img = cv2.resize( frame,(int(dim[0]), int(dim[1])))

    # Convert RGB to BGR [OpenCV reads image in BGR, some networks may need RGB]
    if( ARGS.colormode == "rgb" ):
        img = img[:, :, ::-1]

    # Mean subtraction & scaling [A common technique used to center the data]
    img = img.astype( numpy.float16 )
    img = ( img - numpy.float16( ARGS.mean ) ) * ARGS.scale

    return img

# ---- Step 4: Read & print inference results from the NCS -------------------

def infer_image( graph, img, frame ):
    # Load the image as a half-precision floating point array
    graph.LoadTensor( img, 'user object' )

    # Get the results from NCS
    output, userobj = graph.GetResult()

    # Get execution time
    inference_time = graph.GetGraphOption( mvnc.GraphOption.TIME_TAKEN )

    # Deserialize the output into a python dictionary
    output_dict = deserialize_output.ssd( output, CONFIDANCE_THRESHOLD, frame.shape )

    # Print the results (each image/frame may have multiple objects)
    output_str  = "\n==============================================================\n"
    output_str += "Execution time: "+ "%.1fms" % ( numpy.sum( inference_time )) + "\n"
    for i in range( 0, output_dict['num_detections'] ):
        output_str +=  "%3.1f%%\t" % output_dict['detection_scores_' + str(i)] 
        output_str += labels[ int(output_dict['detection_classes_' + str(i)]) ]
        output_str += ": Top Left: " + str( output_dict['detection_boxes_' + str(i)][0] )
        output_str += " Bottom Right: " + str( output_dict['detection_boxes_' + str(i)][1] )
        output_str += "\n"

        # Draw bounding boxes around valid detections 
        (y1, x1) = output_dict.get('detection_boxes_' + str(i))[0]
        (y2, x2) = output_dict.get('detection_boxes_' + str(i))[1]

        label = labels[output_dict.get('detection_classes_' + str(i))];
        labelsArray = label.split(":");
        if len(labelsArray) == 2:
          label = labelsArray[1]

        # Prep string to overlay on the image
        display_str = ( 
                label
                + ": "
                + str( output_dict.get('detection_scores_' + str(i) ) )
                + "%" )
       
        frame = visualize_output.draw_bounding_box( 
                       y1, x1, y2, x2, 
                       frame,
                       thickness=2,
                       fontsize=20,
                       outlineColor=(0, 255, 0),
                       textColor=(0, 255, 0),
                       display_str=display_str )

    output_str  += "==============================================================\n"

    print( output_str )

    return frame;


    # If a display is available, show the image on which inference was performed
    

# ---- Step 5: Unload the graph and close the device -------------------------

def close_ncs_device( device, graph ):
    graph.DeallocateGraph()
    device.CloseDevice()
    if camera is not None:
        camera.release()
    cv2.destroyAllWindows()

# ---- Main function (entry point for this script ) --------------------------

def main():

    device = open_ncs_device()
    graph = load_graph( device )
    input = ARGS.input.split(":")
    if len(input) == 2:
        if input[0] == "Image":
            frame = cv2.imread(input[1])
            frame = cv2.resize(frame,(FRAME_WIDTH,FRAME_HEIGHT))
            img = pre_process_image( frame )
            output_frame = infer_image( graph, img, frame )
            cv2.imwrite(ARGS.output,output_frame)
        elif input[0] == "Video":
            camera = cv2.VideoCapture(input[1])
            camera.set( cv2.CAP_PROP_FRAME_WIDTH, FRAME_WIDTH )
            camera.set( cv2.CAP_PROP_FRAME_HEIGHT, FRAME_HEIGHT )
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            sock.bind(('', PORT))
            sock.listen(10)
            client, address = sock.accept()
            print ("{} connected".format( address ))
            while( True ):
                ret, frame = camera.read()
                if ret==True:
                    frame = cv2.resize(frame,(FRAME_WIDTH,FRAME_HEIGHT))
                    img = pre_process_image( frame )
                    output_frame = infer_image( graph, img, frame )
                    client.send(output_frame)
    
    close_ncs_device( device, graph )



# ---- Define 'main' function as the entry point for this script -------------

if __name__ == '__main__':

    parser = argparse.ArgumentParser(
                         description="Detect objects on a LIVE camera feed using \
                         Intel® Movidius™ Neural Compute Stick." )

    parser.add_argument( '-g', '--graph', type=str,
                         required=True,
                         help="Absolute path to the neural network graph file." )

    parser.add_argument( '-i', '--input', type=str,
                         required=True,
                         help="Input where objects has to be detected" )

    parser.add_argument( '-o', '--output', type=str,
                         required=True,
                         help="Absolute path to the ouput file" )

    parser.add_argument( '-l', '--labels', type=str,
                         required=True,
                         help="Absolute path to labels file." )

    parser.add_argument( '-M', '--mean', type=float,
                         nargs='+',
                         default=[127.5, 127.5, 127.5],
                         help="',' delimited floating point values for image mean." )

    parser.add_argument( '-S', '--scale', type=float,
                         default=0.00789,
                         help="Absolute path to labels file." )

    parser.add_argument( '-D', '--dim', type=str,
                         required=True,
                         help="Image dimensions. ex. -D 224x224" )

    parser.add_argument( '-c', '--colormode', type=str,
                         default="bgr",
                         help="RGB vs BGR color sequence. This is network dependent." )

    ARGS = parser.parse_args()

    # Load the labels file
    labels =[ line.rstrip('\n') for line in
              open( ARGS.labels ) if line != 'classes\n']

    main()

# ==== End of file ===========================================================
