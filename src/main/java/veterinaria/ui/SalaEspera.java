package veterinaria.ui;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.util.ArrayList;
import java.util.List;

public class SalaEspera extends JFrame {
    private JTextField txtBusquedaCliente;
    private JTextField txtBusquedaMascota;
    private JList<String> listaClientes;
    private JList<String> listaMascotas;
    private JButton btnBuscar;
    private JButton btnAgregarSalaEspera;

    // Datos simulados con algunos homónimos
    private List<Cliente> clientes;
    private DefaultListModel<String> modeloClientes;
    private DefaultListModel<String> modeloMascotas;
    private String clienteSeleccionado;
    private String mascotaSeleccionada;

    public SalaEspera() {
        setTitle("Sala de Espera");
        setSize(800, 500);
        setLayout(new BorderLayout());
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);

        // Inicializar datos simulados
        clientes = new ArrayList<>();
        inicializarDatos();

        // Panel de búsqueda
        JPanel panelBusqueda = new JPanel(new GridLayout(2, 2));
        txtBusquedaCliente = new JTextField();
        txtBusquedaMascota = new JTextField();

        panelBusqueda.add(new JLabel("Buscar por Cliente (Nombre o Apellido):"));
        panelBusqueda.add(txtBusquedaCliente);
        panelBusqueda.add(new JLabel("Buscar por Mascota (Nombre):"));
        panelBusqueda.add(txtBusquedaMascota);

        // Modelos y listas
        modeloClientes = new DefaultListModel<>();
        listaClientes = new JList<>(modeloClientes);
        listaClientes.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        listaClientes.addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting() && listaClientes.getSelectedValue() != null) {
                clienteSeleccionado = listaClientes.getSelectedValue();
                mostrarMascotasAsociadas();
                verificarSeleccion();
            }
        });

        modeloMascotas = new DefaultListModel<>();
        listaMascotas = new JList<>(modeloMascotas);
        listaMascotas.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        listaMascotas.addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting() && listaMascotas.getSelectedValue() != null) {
                mascotaSeleccionada = listaMascotas.getSelectedValue();
                mostrarClientesAsociados();
                verificarSeleccion();
            }
        });

        // Paneles para clientes y mascotas
        JPanel panelListas = new JPanel(new GridLayout(1, 2));
        panelListas.add(new JScrollPane(listaClientes));
        panelListas.add(new JScrollPane(listaMascotas));

        // Botones
        btnBuscar = new JButton("Buscar");
        btnBuscar.addActionListener(this::buscar);

        btnAgregarSalaEspera = new JButton("Agregar a Sala de Espera");
        btnAgregarSalaEspera.setEnabled(false);
        btnAgregarSalaEspera.addActionListener(e -> agregarASalaEspera());

        JPanel panelBotones = new JPanel();
        panelBotones.add(btnBuscar);
        panelBotones.add(btnAgregarSalaEspera);

        // Añadir componentes a la ventana
        add(panelBusqueda, BorderLayout.NORTH);
        add(panelListas, BorderLayout.CENTER);
        add(panelBotones, BorderLayout.SOUTH);

        setVisible(true);
    }

    private void inicializarDatos() {
        // Datos simulados de clientes y sus mascotas, incluyendo homónimos
        clientes.add(new Cliente("Juan Pérez", List.of("Firulais", "Misi")));
        clientes.add(new Cliente("Ana María García", List.of("Rex", "Luna")));
        clientes.add(new Cliente("Carlos Rodríguez", List.of("Luna", "Max")));
        clientes.add(new Cliente("María Fernández", List.of("Bobby")));
        clientes.add(new Cliente("Juan Pérez", List.of("Rex"))); // Homónimo
        clientes.add(new Cliente("Ana María García", List.of("Max"))); // Homónimo
    }

    private void buscar(ActionEvent e) {
        String busquedaCliente = txtBusquedaCliente.getText().toLowerCase();
        String busquedaMascota = txtBusquedaMascota.getText().toLowerCase();

        modeloClientes.clear();
        modeloMascotas.clear();

        // Filtrar y mostrar solo los clientes que coinciden con la búsqueda
        if (!busquedaCliente.isEmpty()) {
            clientes.stream()
                .filter(cliente -> cliente.getNombre().toLowerCase().contains(busquedaCliente))
                .forEach(cliente -> modeloClientes.addElement(cliente.getNombre()));
        } else {
            clientes.forEach(cliente -> modeloClientes.addElement(cliente.getNombre()));
        }

        // Filtrar y mostrar solo las mascotas que coinciden con la búsqueda
        if (!busquedaMascota.isEmpty()) {
            clientes.stream()
                .flatMap(cliente -> cliente.getMascotas().stream())
                .filter(mascota -> mascota.toLowerCase().contains(busquedaMascota))
                .distinct()
                .forEach(modeloMascotas::addElement);
        } else {
            clientes.stream()
                .flatMap(cliente -> cliente.getMascotas().stream())
                .distinct()
                .forEach(modeloMascotas::addElement);
        }

        verificarSeleccion();
    }

    private void mostrarMascotasAsociadas() {
        if (clienteSeleccionado == null) return;

        modeloMascotas.clear();
        clientes.stream()
            .filter(cliente -> cliente.getNombre().equals(clienteSeleccionado))
            .flatMap(cliente -> cliente.getMascotas().stream())
            .forEach(modeloMascotas::addElement);
    }

    private void mostrarClientesAsociados() {
        if (mascotaSeleccionada == null) return;

        modeloClientes.clear();
        clientes.stream()
            .filter(cliente -> cliente.getMascotas().contains(mascotaSeleccionada))
            .forEach(cliente -> modeloClientes.addElement(cliente.getNombre()));
    }

    private void verificarSeleccion() {
        btnAgregarSalaEspera.setEnabled(clienteSeleccionado != null && mascotaSeleccionada != null);
    }

    private void agregarASalaEspera() {
        if (clienteSeleccionado != null && mascotaSeleccionada != null) {
            String mensaje = "Se ha agregado a " + clienteSeleccionado + " y a " + mascotaSeleccionada + " a la sala de espera.";
            JOptionPane.showMessageDialog(this, mensaje);
        }
    }

    // Clase interna para representar un cliente
    class Cliente {
        private String nombre;
        private List<String> mascotas;

        public Cliente(String nombre, List<String> mascotas) {
            this.nombre = nombre;
            this.mascotas = mascotas;
        }

        public String getNombre() {
            return nombre;
        }

        public List<String> getMascotas() {
            return mascotas;
        }
    }
}
