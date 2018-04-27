#----------------------------------------------------------------------------------------------------------------------
# Configs
#----------------------------------------------------------------------------------------------------------------------

CURRENT_DIR 	= $(shell pwd)

#----------------------------------------------------------------------------------------------------------------------
# Targets
#----------------------------------------------------------------------------------------------------------------------



.PHONY: all
all: fetch ilsvrc12 googlenet

.PHONY: fetch
fetch: 
	@$(call msg,"Fetching ..."); 
	@$(call clone,https://github.com/movidius/ncappzoo,$(CURRENT_DIR),master)

.PHONY: ilsvrc12
ilsvrc12:
	@$(call msg,"making ilsvrc12")
	(cd ./ncappzoo/data/ilsvrc12; make;)

.PHONY: gendernet
gendernet: 
	@$(call msg,"making gendernet")
	(cd ./ncappzoo/caffe/GenderNet; make compile;)

.PHONY: agenet
agenet: 
	@$(call msg,"making AgeNet")
	(cd ./ncappzoo/caffe/AgeNet; make compile;)

.PHONY: mobilenet
mobilenet: 
	@$(call msg,"making mobilenet")
	(cd ./ncappzoo/tensorflow/mobilenets; make compile;)

.PHONY: googlenet
googlenet: 
	@$(call msg,"making googlenet")
	(cd ./ncappzoo/caffe/GoogLeNet; make compile;)

.PHONY: squeezenet
squeezenet:
	@$(call msg,"making squeezenet")
	(cd ./ncappzoo/caffe/SqueezeNet; make compile;)

.PHONY: alexnet
alexnet:
	@$(call msg,"making alexet")
	(cd ./ncappzoo/caffe/AlexNet; make compile;)



#----------------------------------------------------------------------------------------------------------------------
# helper functions
#----------------------------------------------------------------------------------------------------------------------
define msg
	tput setaf 2 && \
	for i in $(shell seq 1 120 ); do printf "-"; done; printf "\n\t" && \
	printf $1 && printf "\n" && \
	for i in $(shell seq 1 120 ); do printf "-"; done; printf "\n" && \
	tput sgr0
endef

define clone
	if [ ! -f "$(2)/$(notdir $(1))/.fetch" ]; then \
		mkdir -p $(2); \
		cd $(2) && rm -rf $(notdir $(1)) && git clone $(1) -b $(3) && \
		touch $(2)/$(notdir $(1))/.fetch; \
	fi 
endef

