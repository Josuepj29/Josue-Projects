
const recordatoriosMVet = [
  {
    grupo: "Cita médica",
    items: [
      { value: "cita_medica", text: "Cita médica - 1 día" }
    ]
  },
  {
    grupo: "Vacunas Perros",
    items: [
      { value: "vacuna_puppy_14", text: "Vac. Puppy - 14 días" },
      { value: "vacuna_puppy_21", text: "Vac. Puppy - 21 días" },
      { value: "vacuna_cuadruple_14", text: "Vac. Cuádruple - 14 días" },
      { value: "vacuna_cuadruple_21", text: "Vac. Cuádruple - 21 días" },
      { value: "vacuna_quintuple_14", text: "Vac. Quíntuple - 14 días" },
      { value: "vacuna_quintuple_21", text: "Vac. Quíntuple - 21 días" },
      { value: "vacuna_quintuple_180", text: "Vac. Quíntuple - 180 días" },
      { value: "vacuna_quintuple_corona_14", text: "Vac. Quíntuple + Coronavirus - 14 días" },
      { value: "vacuna_quintuple_corona_21", text: "Vac. Quíntuple + Coronavirus - 21 días" },
      { value: "vacuna_quintuple_corona_180", text: "Vac. Quíntuple + Coronavirus - 180 días" },
      { value: "vacuna_sextuple_rabia", text: "Vac. Séxtuple + rabia - 365 días" },
      { value: "vacuna_kc", text: "Vac. KC - 365 días" },
      { value: "vacuna_rabia_perro", text: "Vac. Rabia - 365 días" }
    ]
  },
  {
    grupo: "Desparasitación externa",
    items: [
      { value: "desparasitacion_externa_pipetas_14", text: "Pipetas - 14 días" },
      { value: "desparasitacion_externa_pipetas_30", text: "Pipetas - 30 días" },
      { value: "desparasitacion_externa_30", text: "Desparasitación externa - 30 días" },
      { value: "desparasitacion_externa_90", text: "Desparasitación externa - 90 días" }
    ]
  },
  {
    grupo: "Desparasitación interna",
    items: [
      { value: "desparasitacion_interna_oxantel_1", text: "Oxantel - 1 día" },
      { value: "desparasitacion_interna_oxantel_10", text: "Oxantel - 10 días" },
      { value: "desparasitacion_interna_oxantel_30", text: "Oxantel - 30 días" },
      { value: "desparasitacion_interna_oxantel_60", text: "Oxantel - 60 días" },
      { value: "desparasitacion_interna_puppymec_1", text: "Puppymec - 1 día" },
      { value: "desparasitacion_interna_puppymec_10", text: "Puppymec - 10 días" },
      { value: "desparasitacion_interna_puppymec_14", text: "Puppymec - 14 días" },
      { value: "desparasitacion_interna_fripets_10", text: "Fripets - 10 días" },
      { value: "desparasitacion_interna_fripets_30", text: "Fripets - 30 días" },
      { value: "desparasitacion_interna_fripets_60", text: "Fripets - 60 días" }
    ]
  },
  {
    grupo: "Vacunas Gatos",
    items: [
      { value: "vacuna_gato_triple_14", text: "Vac. Triple felina - 14 días" },
      { value: "vacuna_gato_triple_21", text: "Vac. Triple felina - 21 días" },
      { value: "vacuna_gato_triple_365", text: "Vac. Triple felina - 365 días" },
      { value: "vacuna_gato_leucemia", text: "Vac. Leucemia - 30 días" },
      { value: "vacuna_gato_rabia", text: "Vac. Rabia - 365 días" }
    ]
  }
];

const recordatoriosGruposPelu = [
  {
    grupo: "Baño",
    items: [
      { value: "siguiente_bano_7", text: "Siguiente baño medicado - 7 días" },
      { value: "siguiente_bano_21", text: "Siguiente baño - 21 días" }
    ]
  },
  {
    grupo: "Pipetas",
    items: [
      { value: "pipetas_14", text: "Pipetas - 14 días" },
      { value: "pipetas_30", text: "Pipetas - 30 días" }
    ]
  },
  {
    grupo: "Desparasitación",
    items: [
      { value: "desparasitacion_externa_30", text: "Desparasitación externa - 30 días" },
      { value: "desparasitacion_externa_90", text: "Desparasitación externa - 90 días" },
      { value: "oxantel_1", text: "Oxantel - 1 día" },
      { value: "oxantel_10", text: "Oxantel - 10 días" },
      { value: "oxantel_30", text: "Oxantel - 30 días" },
      { value: "oxantel_60", text: "Oxantel - 60 días" },
      { value: "puppymec_1", text: "Puppymec - 1 día" },
      { value: "puppymec_10", text: "Puppymec - 10 días" },
      { value: "puppymec_14", text: "Puppymec - 14 días" },
      { value: "fripets_10", text: "Fripets - 10 días" },
      { value: "fripets_30", text: "Fripets - 30 días" },
      { value: "fripets_60", text: "Fripets - 60 días" }
    ]
  }
];
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

window.recordatoriosGruposPelu = recordatoriosGruposPelu;
window.recordatoriosMVet = recordatoriosMVet;
window.textosRecordatoriosPelu = window.textosRecordatoriosPelu;
window.textosRecordatoriosMVet = window.textosRecordatoriosMVet;
