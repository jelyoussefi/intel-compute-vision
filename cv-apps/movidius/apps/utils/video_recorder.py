#import sys
#from subprocess import call
import os

def record(inputFile, inputFormat, width, height, outputFile):

	ffmpeg_cmd = 'ffmpeg -hide_banner -loglevel panic -f rawvideo -pix_fmt {} -s {}x{}  -an -i {} -c:v libx264 -preset ultrafast -b:v 2500k \
		-tune zerolatency -an -movflags frag_keyframe+empty_moov -fflags +genpts+igndts+nobuffer+fastseek  -frag_duration 5000 -y {}  &'.format(inputFormat, width, height, inputFile, outputFile)
	print(ffmpeg_cmd)
	os.system(ffmpeg_cmd) 

	return True




