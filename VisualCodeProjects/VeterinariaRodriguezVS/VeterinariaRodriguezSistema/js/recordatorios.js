const recordatoriosMVet = [
  {
    grupo: "Cita médica",
    items: [
      { value: "mv_cita_medica_1", text: "Cita médica - 1 día" }
    ]
  },
  {
    grupo: "Vacunas Perros",
    items: [
      { value: "mv_vacuna_puppy_14", text: "Vac. Puppy - 14 días" },
      { value: "mv_vacuna_puppy_21", text: "Vac. Puppy - 21 días" },
      { value: "mv_vacuna_cuadruple_14", text: "Vac. Cuádruple - 14 días" },
      { value: "mv_vacuna_cuadruple_21", text: "Vac. Cuádruple - 21 días" },
      { value: "mv_vacuna_quintuple_14", text: "Vac. Quíntuple - 14 días" },
      { value: "mv_vacuna_quintuple_21", text: "Vac. Quíntuple - 21 días" },
      { value: "mv_vacuna_quintuple_180", text: "Vac. Quíntuple - 180 días" },
      { value: "mv_vacuna_quintuple_corona_14", text: "Vac. Quíntuple + Coronavirus - 14 días" },
      { value: "mv_vacuna_quintuple_corona_21", text: "Vac. Quíntuple + Coronavirus - 21 días" },
      { value: "mv_vacuna_quintuple_corona_180", text: "Vac. Quíntuple + Coronavirus - 180 días" },
      { value: "mv_vacuna_sextuple_rabia", text: "Vac. Séxtuple + rabia - 365 días" },
      { value: "mv_vacuna_kc", text: "Vac. KC - 365 días" },
      { value: "mv_vacuna_rabia_perro", text: "Vac. Rabia - 365 días" }
    ]
  },
  {
    grupo: "Desparasitación externa",
    items: [
      { value: "mv_pipetas_14", text: "Pipetas - 14 días" },
      { value: "mv_pipetas_30", text: "Pipetas - 30 días" },
      { value: "mv_desparasitacion_externa_30", text: "Desparasitación externa - 30 días" },
      { value: "mv_desparasitacion_externa_90", text: "Desparasitación externa - 90 días" }
    ]
  },
  {
    grupo: "Desparasitación interna",
    items: [
      { value: "mv_oxantel_1", text: "Oxantel - 1 día" },
      { value: "mv_oxantel_10", text: "Oxantel - 10 días" },
      { value: "mv_oxantel_30", text: "Oxantel - 30 días" },
      { value: "mv_oxantel_60", text: "Oxantel - 60 días" },
      { value: "mv_puppymec_1", text: "Puppymec - 1 día" },
      { value: "mv_puppymec_10", text: "Puppymec - 10 días" },
      { value: "mv_puppymec_14", text: "Puppymec - 14 días" },
      { value: "mv_fripets_10", text: "Fripets - 10 días" },
      { value: "mv_fripets_30", text: "Fripets - 30 días" },
      { value: "mv_fripets_60", text: "Fripets - 60 días" }
    ]
  },
  {
    grupo: "Vacunas Gatos",
    items: [
      { value: "mv_vacuna_gato_triple_14", text: "Vac. Triple felina - 14 días" },
      { value: "mv_vacuna_gato_triple_21", text: "Vac. Triple felina - 21 días" },
      { value: "mv_vacuna_gato_triple_365", text: "Vac. Triple felina - 365 días" },
      { value: "mv_vacuna_gato_leucemia", text: "Vac. Leucemia - 30 días" },
      { value: "mv_vacuna_gato_rabia", text: "Vac. Rabia - 365 días" }
    ]
  }
];

const recordatoriosGruposPelu = [
  {
    grupo: "Baño",
    items: [
      { value: "pelu_siguiente_bano_7", text: "Siguiente baño medicado - 7 días" },
      { value: "pelu_siguiente_bano_21", text: "Siguiente baño - 21 días" }
    ]
  },
  {
    grupo: "Pipetas",
    items: [
      { value: "pelu_pipetas_14", text: "Pipetas - 14 días" },
      { value: "pelu_pipetas_30", text: "Pipetas - 30 días" }
    ]
  },
  {
    grupo: "Desparasitación",
    items: [
      { value: "pelu_desparasitacion_externa_30", text: "Desparasitación externa - 30 días" },
      { value: "pelu_desparasitacion_externa_90", text: "Desparasitación externa - 90 días" },
      { value: "pelu_oxantel_1", text: "Oxantel - 1 día" },
      { value: "pelu_oxantel_10", text: "Oxantel - 10 días" },
      { value: "pelu_oxantel_30", text: "Oxantel - 30 días" },
      { value: "pelu_oxantel_60", text: "Oxantel - 60 días" },
      { value: "pelu_puppymec_1", text: "Puppymec - 1 día" },
      { value: "pelu_puppymec_10", text: "Puppymec - 10 días" },
      { value: "pelu_puppymec_14", text: "Puppymec - 14 días" },
      { value: "pelu_fripets_10", text: "Fripets - 10 días" },
      { value: "pelu_fripets_30", text: "Fripets - 30 días" },
      { value: "pelu_fripets_60", text: "Fripets - 60 días" }
    ]
  }
];

// Indexación para texto por value
window.textosRecordatoriosPelu = {};
recordatoriosGruposPelu.forEach(grupo => {
  grupo.items.forEach(item => {
    window.textosRecordatoriosPelu[item.value] = item.text;
  });
});

window.textosRecordatoriosMVet = {};
recordatoriosMVet.forEach(grupo => {
  grupo.items.forEach(item => {
    window.textosRecordatoriosMVet[item.value] = item.text;
  });
});

// Asignación global
window.recordatoriosGruposPelu = recordatoriosGruposPelu;
window.recordatoriosMVet = recordatoriosMVet;


 // window.textosRecordatoriosPelu = window.textosRecordatoriosPelu;
// window.textosRecordatoriosMVet = window.textosRecordatoriosMVet;
