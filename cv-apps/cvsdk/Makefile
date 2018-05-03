#----------------------------------------------------------------------------------------------------------------------
# Configs
#----------------------------------------------------------------------------------------------------------------------

CURRENT_DIR 	= $(shell pwd)
INTEL_CVSDK_DIR = /opt/intel/computer_vision_sdk_2018.0.234/
BUILD_TYPE 	= Release
BUILD_DIR 	= ${CURRENT_DIR}/build
APPLICATIONS_DIR = ${CURRENT_DIR}/apps

APPLICATIONS = classification_sample
#----------------------------------------------------------------------------------------------------------------------
# Targets
#----------------------------------------------------------------------------------------------------------------------
all:
	@$(call msg,"Building")
	@mkdir -p ${BUILD_DIR}
	@mkdir -p ${APPLICATIONS_DIR}
	@cd ${BUILD_DIR} && \
		cmake -DCMAKE_BUILD_TYPE=${BUILD_TYPE} ${INTEL_CVSDK_DIR}/deployment_tools/inference_engine/samples/ && \
		for app in ${APPLICATIONS} ; do \
			make $$app && \
			cd ${APPLICATIONS_DIR} && ln -sf ${BUILD_DIR}/intel64/${BUILD_TYPE}/$$app; \
		done
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
