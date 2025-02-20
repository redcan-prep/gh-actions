export const jsonSchema = {
  singularDisplay: "Declaration Question",
  entity: "reg_declarationquestion",
  attributes: {
    reg_registrationstatusid: {
      labelname: "Destination License Status",
      datatype: "lookup",
      required: false,
      description:
        "Enter the destination license status that this declaration question is associated with.",
      connectedspace: "reg_registrationstatus",
    },
    tc_name: {
      labelname: "Name",
      datatype: "String",
      required: true,
      description:
        "Enter a unique name for the individual license declaration question.",
    },
    reg_section_ordinal: {
      labelname: "Section Ordinal",
      datatype: "Integer",
      required: true,
      description:
        "Enter the section number indicating the display order of this declaration text.",
    },
    reg_requires_upload: {
      labelname: "Requires Upload?",
      datatype: "radio",
      required: false,
      description:
        "Select “Yes” if the declaration question requires a document upload. Uploading a document for the declaration question is not required when this is set to “No” or “Unset”.",
    },
    reg_correct_answer: {
      labelname: "Correct Answer",
      datatype: "radio",
      required: true,
      description:
        "Select “Yes” if this is the correct answer. It is not the correct answer when this is set to “No” or “Unset”.",
    },
    reg_always_show_additional_details: {
      labelname: "Always Show Additional Details",
      datatype: "radio",
      required: false,
      description:
        "Select “Yes” if the Additional Details field is always shown on the portal page.",
    },

    reg_visible_to_application_process: {
      labelname: "Application Process",
      datatype: "radio",
      required: false,
      description:
        "Select “Yes” if this declaration question is visible to the application process. The declaration question is not visible to the application process when this is set to “No” or “Unset”.",
    },
    reg_visible_to_renewal_process: {
      labelname: "Renewal Process",
      datatype: "radio",
      required: false,
      description:
        "Select “Yes” if this declaration question is visible to the renewal process. The declaration question is not visible to the renewal process when this is set to “No” or “Unset”.",
    },
    reg_visible_to_reinstatement_process: {
      labelname: "Reinstatement Process",
      datatype: "radio",
      required: false,
      description:
        "Select “Yes” if this declaration question is visible to the reinstatement process. The declaration question is not visible to the reinstatement process when this is set to “No” or “Unset”.",
    },
    reg_visible_to_status_change_process: {
      labelname: "Status Change Process",
      datatype: "radio",
      required: true,
      description:
        "Select “Yes” if this declaration question is visible to the status change process. The declaration question is not visible to the status change process when this is set to “No” or “Unset”.",
    },
  },
};
