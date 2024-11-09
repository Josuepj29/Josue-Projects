package veterinaria.ui;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.util.ArrayList;
import java.util.List;

public class ListadoBanos extends JFrame {
    private JList<String> listaMascotas;
    private JList<String> listaVisitas;
    private JComboBox<String> comboServicios;
    private JTextField txtPrecio;
    private JTextField txtACuenta;
    private JTextField txtResta;
    private JButton btnProcesarServicio;
    private DefaultListModel<String> modeloMascotas;
    private DefaultListModel<String> modeloVisitas;

    private List<String> mascotasRegistradas;

    public ListadoBanos(List<String> mascotasRegistradas) {
        this.mascotasRegistradas = mascotasRegistradas;
        setTitle("Listado de Baños");
        setSize(800, 500);
        setLayout(new BorderLayout());
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);

        // Panel 1: Lista de Mascotas
        modeloMascotas = new DefaultListModel<>();
        listaMascotas = new JList<>(modeloMascotas);
        listaMascotas.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        cargarMascotasRegistradas();

        // Panel 2: Lista de Visitas
        modeloVisitas = new DefaultListModel<>();
        listaVisitas = new JList<>(modeloVisitas);
        listaVisitas.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        cargarVisitasEjemplo();

        // Agregar evento de doble clic en las visitas
        listaVisitas.addMouseListener(new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                if (e.getClickCount() == 2 && listaVisitas.getSelectedValue() != null) {
                    mostrarObservacion(listaVisitas.getSelectedValue());
                }
            }
        });

        // Panel 3: Combo Box de Servicios y Campos de Texto
        String[] servicios = {"Baño estético", "Baño medicado", "Baño y corte", "Baño y corte medicado"};
        comboServicios = new JComboBox<>(servicios);
        comboServicios.setPreferredSize(new Dimension(150, 25));

        txtPrecio = new JTextField(5);
        txtACuenta = new JTextField(5);
        txtResta = new JTextField(5);

        // Panel para Combo Box y Campos de Texto
        JPanel panelServicios = new JPanel();
        panelServicios.setLayout(new GridLayout(4, 2, 5, 5));

        panelServicios.add(new JLabel("Servicio:"));
        panelServicios.add(comboServicios);
        panelServicios.add(new JLabel("Precio:"));
        panelServicios.add(txtPrecio);
        panelServicios.add(new JLabel("A cuenta:"));
        panelServicios.add(txtACuenta);
        panelServicios.add(new JLabel("Resta:"));
        panelServicios.add(txtResta);

        // Layout de los paneles
        JPanel panelListas = new JPanel(new GridLayout(1, 3));
        panelListas.add(new JScrollPane(listaMascotas));
        panelListas.add(new JScrollPane(listaVisitas));
        panelListas.add(panelServicios);

        // Botones
        btnProcesarServicio = new JButton("Procesar");
        btnProcesarServicio.setPreferredSize(new Dimension(100, 25));
        btnProcesarServicio.addActionListener(this::procesarServicio);

        JPanel panelBotones = new JPanel();
        panelBotones.add(btnProcesarServicio);

        add(panelListas, BorderLayout.CENTER);
        add(panelBotones, BorderLayout.SOUTH);

        setVisible(true);
    }

    private void cargarMascotasRegistradas() {
        modeloMascotas.clear();
        modeloMascotas.addElement("Firulais (Dueño: Juan Pérez)");
        modeloMascotas.addElement("Misi (Dueño: Juan Pérez)");
        modeloMascotas.addElement("Rex (Dueño: Ana María García)");
        modeloMascotas.addElement("Luna (Dueño: Ana María García)");
        modeloMascotas.addElement("Max (Dueño: Carlos Rodríguez)");
    }

    private void cargarVisitasEjemplo() {
        modeloVisitas.clear();
        modeloVisitas.addElement("Visita 1: 12/01/2024 - Baño y corte");
        modeloVisitas.addElement("Visita 2: 25/02/2024 - Baño medicado");
        modeloVisitas.addElement("Visita 3: 13/03/2024 - Baño estético");
        modeloVisitas.addElement("Visita 4: 30/04/2024 - Baño y corte medicado");
        modeloVisitas.addElement("Visita 5: 18/05/2024 - Baño medicado");
    }

    private void mostrarObservacion(String visita) {
        // Crear un nuevo JFrame para mostrar la observación
        JFrame observacionFrame = new JFrame("Observación de la " + visita);
        observacionFrame.setSize(400, 200);
        observacionFrame.setLocationRelativeTo(this);

        // Crear un JTextArea para mostrar la observación (no editable)
        JTextArea textAreaObservacion = new JTextArea();
        textAreaObservacion.setText("Observación de " + visita + ":\nLa mascota estaba nerviosa al inicio, pero se calmó durante el baño.");
        textAreaObservacion.setEditable(false);
        textAreaObservacion.setLineWrap(true);
        textAreaObservacion.setWrapStyleWord(true);

        // Agregar el JTextArea a un JScrollPane
        JScrollPane scrollPane = new JScrollPane(textAreaObservacion);

        // Añadir el JScrollPane al JFrame
        observacionFrame.add(scrollPane);
        observacionFrame.setVisible(true);
    }

    private void procesarServicio(ActionEvent e) {
        String mascotaSeleccionada = listaMascotas.getSelectedValue();
        String servicioSeleccionado = (String) comboServicios.getSelectedItem();
        String precio = txtPrecio.getText();
        String aCuenta = txtACuenta.getText();
        String resta = txtResta.getText();

        if (mascotaSeleccionada != null && servicioSeleccionado != null && !precio.isEmpty()) {
            String mensaje = "Se ha procesado el servicio: " + servicioSeleccionado + " para " + mascotaSeleccionada +
                             " con un precio de " + precio + ", a cuenta de " + aCuenta + ", y resta " + resta + ".";

            JOptionPane.showMessageDialog(this, mensaje);
        } else {
            JOptionPane.showMessageDialog(this, "Complete todos los campos: seleccione una mascota, un servicio, e ingrese el precio, a cuenta, y el monto restante.", "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    public static void main(String[] args) {
        // Ejemplo de mascotas registradas para baño
        List<String> mascotas = new ArrayList<>();
        mascotas.add("Firulais (Dueño: Juan Pérez)");
        mascotas.add("Misi (Dueño: Juan Pérez)");
        mascotas.add("Rex (Dueño: Ana María García)");
        mascotas.add("Luna (Dueño: Ana María García)");
        mascotas.add("Max (Dueño: Carlos Rodríguez)");
        new ListadoBanos(mascotas);
    }
}
