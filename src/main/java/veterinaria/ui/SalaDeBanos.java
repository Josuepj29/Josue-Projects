package veterinaria.ui;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.List;

public class SalaDeBanos extends JFrame {
    private JTable tablaMascotas;
    private DefaultTableModel modeloTabla;
    private JComboBox<String> comboEstado;

    public SalaDeBanos(List<MascotaInfo> mascotasEnSala) {
        setTitle("Sala de Baños");
        setSize(800, 400);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);

        // Crear la tabla con las columnas necesarias
        String[] columnas = {"Mascota", "Dueño", "Fecha y Hora de Ingreso", "Pago", "A Cuenta", "Resta", "Estado del Servicio"};
        modeloTabla = new DefaultTableModel(columnas, 0);
        tablaMascotas = new JTable(modeloTabla);
        tablaMascotas.setEnabled(true); // Habilitamos la edición de la tabla para seleccionar la fila

        // Llenar la tabla con la información de las mascotas en la sala de baños
        for (MascotaInfo info : mascotasEnSala) {
            modeloTabla.addRow(new Object[] {
                info.getMascota(),
                info.getDueno(),
                info.getFechaHoraIngreso(),
                info.getPago(),
                info.getACuenta(),
                info.getResta(),
                info.getEstadoServicio()
            });
        }

        // Añadir la tabla a un JScrollPane para manejar el desplazamiento
        JScrollPane scrollPane = new JScrollPane(tablaMascotas);
        add(scrollPane, BorderLayout.CENTER);

        // ComboBox para seleccionar el estado del servicio
        comboEstado = new JComboBox<>(new String[] {"Retirado"});
        comboEstado.setEnabled(true); // Habilitamos al principio

        // Botón de confirmación para actualizar el estado
        JButton btnConfirmar = new JButton("Confirmar Estado");
        btnConfirmar.addActionListener(e -> {
            // Verifica si hay una fila seleccionada en la tabla
            int selectedRow = tablaMascotas.getSelectedRow();
            if (selectedRow != -1) {
                // Si hay una fila seleccionada, actualizamos el estado en la tabla
                String estadoSeleccionado = (String) comboEstado.getSelectedItem();
                modeloTabla.setValueAt(estadoSeleccionado, selectedRow, 6); // Actualiza el estado de servicio en la columna correspondiente

                // Deshabilitamos el combo después de confirmar el estado
                comboEstado.setEnabled(false); 
            } else {
                JOptionPane.showMessageDialog(this, "Seleccione una mascota para actualizar su estado.", "Error", JOptionPane.ERROR_MESSAGE);
            }
        });

        // Panel para el ComboBox y el Botón
        JPanel panelAcciones = new JPanel();
        panelAcciones.add(new JLabel("Estado del Servicio:"));
        panelAcciones.add(comboEstado);
        panelAcciones.add(btnConfirmar);

        add(panelAcciones, BorderLayout.SOUTH);

        setVisible(true);
    }

    // Clase interna para representar la información de una mascota
    public static class MascotaInfo {
        private String mascota;
        private String dueno;
        private String fechaHoraIngreso;
        private String pago;
        private String aCuenta;
        private String resta;
        private String estadoServicio;

        public MascotaInfo(String mascota, String dueno, String fechaHoraIngreso, String pago, String aCuenta, String resta, String estadoServicio) {
            this.mascota = mascota;
            this.dueno = dueno;
            this.fechaHoraIngreso = fechaHoraIngreso;
            this.pago = pago;
            this.aCuenta = aCuenta;
            this.resta = resta;
            this.estadoServicio = estadoServicio;
        }

        public String getMascota() {
            return mascota;
        }

        public String getDueno() {
            return dueno;
        }

        public String getFechaHoraIngreso() {
            return fechaHoraIngreso;
        }

        public String getPago() {
            return pago;
        }

        public String getACuenta() {
            return aCuenta;
        }

        public String getResta() {
            return resta;
        }

        public String getEstadoServicio() {
            return estadoServicio;
        }
    }
}
