const reg_applicationinstructions_schema = {
  singularDisplay: "Application Instructions",
  entity: "reg_applicationinstructions",
  attributes: {
    tc_name: {
      labelname: "Name",
      datatype: "String",
      required: true,
      description:
        "Enter a unique name for the individual license application instruction.",
    },
    reg_instructions: {
      labelname: "reg_instructions",
      datatype: "textarea",
      required: true,
      description:
        "Enter the instructions for this individual license application.",
    },
  },
};

const reg_documenttype_schema = {
  singularDisplay: "Document Types",
  entity: "reg_documenttype",
  attributes: {
    tc_name: {
      labelname: "Name",
      datatype: "String",
      required: true,
      description: "Enter a unique name for the document type.",
    },
    reg_instructions: {
      labelname: "Instruction",
      datatype: "textarea",
      required: false,
      description: "Enter the instruction for using the document type.",
    },
    reg_upload_text: {
      labelname: "Upload Text",
      datatype: "textarea",
      required: false,
      description: "Enter the upload instruction for using the document type.",
    },
  },
};

const reg_applicationrequireddocument_schema = {
  singularDisplay: "Application Required Documents",
  entity: "reg_documenttype",
  attributes: {
    tc_name: {
      labelname: "Name",
      datatype: "String",
      required: true,
      description:
        "Enter a unique name for the individual license application required document.",
    },
    reg_documenttypeid: {
      labelname: "Document Type",
      datatype: "lookup",
      required: true,
      description:
        "Enter the document type that this individual license application required document is associated with.",
      connectedspace: "reg_documenttype",
    },
    reg_instructions: {
      labelname: "Display Ordinal",
      datatype: "Integer",
      required: false,
      description:
        "Enter the number indicating the display order of this individual license application instruction.",
    },
    reg_upload_online: {
      labelname: "Must Upload Online?",
      datatype: "radio",
      required: false,
      description:
        "Select “Yes” if the individual license document type must be uploaded online. The individual license document type does not need to be uploaded online when this is set to “No” or “Unset”.",
    },
    reg_is_optional: {
      labelname: "Is Optional?",
      datatype: "radio",
      required: false,
      description:
        "Select “Yes” if this individual license document type is optional. It is required when set to “No” or not used when set to “Unset”.",
    },
    reg_registrationclassid: {
      labelname: "License Type",
      datatype: "lookup",
      required: false,
      description:
        "Select the license type that this individual license application required document is associated with. ",
      connectedspace: "reg_classofregistration",
    },
  },
};

export {
  reg_applicationinstructions_schema,
  reg_applicationrequireddocument_schema,
  reg_documenttype_schema,
};
