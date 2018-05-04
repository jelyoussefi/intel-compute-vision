#!/usr/bin/python3

# ****************************************************************************
# Copyright(c) 2017 Intel Corporation. 
# License: MIT See LICENSE file in root directory.
# ****************************************************************************

# How to classify images using DNNs on Intel Neural Compute Stick (NCS)
from mvnc import mvncapi as mvnc
import sys
import numpy
import cv2
import argparse
import ntpath
import time
import csv
import os
import sys
import re
from os import system


# Number of top prodictions to print
NUM_PREDICTIONS      = 4

# Variable to store commandline arguments
ARGS                 = None

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

def pre_process_image( img_draw ):

    # Resize image [Image size is defined during training]
    dim = ARGS.dim.split("x")
    img = cv2.resize(img_draw,(int(dim[0]), int(dim[1])))

    # Mean subtraction & scaling [A common technique used to center the data]
    img = img.astype( numpy.float16 )
    img = ( img - numpy.float16( ARGS.mean ) ) * ARGS.scale

    return img;

# ---- Step 4: Read & print inference results from the NCS -------------------

def infer_image( graph, img ):

    labels = numpy.loadtxt(ARGS.labels,str,delimiter='\t')

    # The first inference takes an additional ~20ms due to memory 
    # initializations, so we make a 'dummy forward pass'.
    graph.LoadTensor( img, 'user object' )
    output, userobj = graph.GetResult()

    # Load the image as a half-precision floating point array
    graph.LoadTensor( img, 'user object' );

    # Get the results from NCS
    output, userobj = graph.GetResult()

    # Sort the indices of top predictions
    order = output.argsort()[::-1][:NUM_PREDICTIONS]

    # Get execution time
    inference_time = numpy.sum( graph.GetGraphOption( mvnc.GraphOption.TIME_TAKEN ) )
    inference_time = float("{0:.1f}".format(float(inference_time)))
    output_str  = "\n==============================================================\n"
    output_str += "Top predictions for " + ntpath.basename( ARGS.image ) + "\n"
    output_str += "Execution time: " + str( inference_time ) + "ms\n" 
    output_str += "--------------------------------------------------------------\n"
    for i in range( 0, NUM_PREDICTIONS ):
        output_str +=  "%3.1f%%\t" % (100.0 * output[ order[i] ] ) + labels[ order[i] ] + "\n"
    output_str += "==============================================================";

    print(output_str)


# ---- Step 5: Unload the graph and close the device -------------------------

def close_ncs_device( device, graph ):
    graph.DeallocateGraph()
    device.CloseDevice()

# ---- Main function (entry point for this script ) --------------------------

def main():

    device = open_ncs_device()
    graph = load_graph( device )

    img_draw = cv2.imread(ARGS.image)
    img = pre_process_image( img_draw )

    infer_image( graph, img )

    close_ncs_device( device, graph )

# ---- Define 'main' function as the entry point for this script -------------

if __name__ == '__main__':

    parser = argparse.ArgumentParser(
                         description="Image classifier using \
                         Intel® Movidius™ Neural Compute Stick." )

    parser.add_argument( '-g', '--graph', type=str,
                         required=True,
                         help="Absolute path to the neural network graph file." )

    parser.add_argument( '-i', '--image', type=str,
                         required=True,
                         help="Absolute path to the image that needs to be inferred." )

    parser.add_argument( '-l', '--labels', type=str,
                         required=True,
                         help="Absolute path to labels file." )

    parser.add_argument( '-M', '--mean', type=float,
                         nargs='+',
                         default=[104.00698793, 116.66876762, 122.67891434],
                         help="',' delimited floating point values for image mean." )

    parser.add_argument( '-S', '--scale', type=float,
                         default=1,
                         help="Scale value." )

    parser.add_argument( '-D', '--dim', type=str,
                         required=True,
                         help="Image dimensions. ex. -D 224x224" )

    parser.add_argument( '-c', '--colormode', type=str,
                         default="bgr",
                         help="RGB vs BGR color sequence. This is network dependent." )

    ARGS = parser.parse_args()

    
    main()

# ==== End of file ===========================================================
