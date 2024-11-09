package veterinaria.ui;

import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class BuscarCliente extends JFrame {

    private JTextField txtBuscar;
    private JButton btnBuscar;
    private JList<String> listaClientes; // Esta lista se usará para mostrar los resultados de búsqueda
    private DefaultListModel<String> modeloLista; // Modelo de la lista
    private JButton btnSeleccionarCliente;

    public BuscarCliente() {
        setTitle("Buscar Cliente");
        setSize(400, 300);
        setLayout(null);
        setLocationRelativeTo(null);

        JLabel lblBuscar = new JLabel("Buscar Cliente:");
        lblBuscar.setBounds(50, 20, 100, 25);
        add(lblBuscar);

        txtBuscar = new JTextField();
        txtBuscar.setBounds(150, 20, 150, 25);
        add(txtBuscar);

        btnBuscar = new JButton("Buscar");
        btnBuscar.setBounds(150, 60, 100, 30);
        add(btnBuscar);

        modeloLista = new DefaultListModel<>();
        listaClientes = new JList<>(modeloLista);
        JScrollPane scrollPane = new JScrollPane(listaClientes);
        scrollPane.setBounds(50, 100, 300, 100);
        add(scrollPane);

        btnSeleccionarCliente = new JButton("Seleccionar Cliente");
        btnSeleccionarCliente.setBounds(100, 220, 180, 30);
        add(btnSeleccionarCliente);

        // Acción del botón buscar
        btnBuscar.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                buscarClientes(txtBuscar.getText());
            }
        });

        // Acción del botón seleccionar cliente
        btnSeleccionarCliente.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                seleccionarCliente();
            }
        });
    }

    private void buscarClientes(String query) {
        // Simulación de búsqueda en base de datos (por implementar)
        modeloLista.clear();
        modeloLista.addElement("Cliente 1 - ID: 1"); // Ejemplo
        modeloLista.addElement("Cliente 2 - ID: 2"); // Ejemplo
    }

    private void seleccionarCliente() {
        String clienteSeleccionado = listaClientes.getSelectedValue();
        if (clienteSeleccionado != null) {
            int clienteId = obtenerIdDesdeSeleccion(clienteSeleccionado);

            // Abre la ventana de registro de mascota para este cliente
            RegistroMascota registroMascota = new RegistroMascota(clienteId);
            registroMascota.setVisible(true);

            // Cierra la ventana de búsqueda
            dispose();
        } else {
            JOptionPane.showMessageDialog(this, "Por favor, seleccione un cliente.");
        }
    }

    private int obtenerIdDesdeSeleccion(String clienteSeleccionado) {
        // Supongamos que el ID está al final de la cadena, después de "ID: "
        String[] partes = clienteSeleccionado.split("ID: ");
        return Integer.parseInt(partes[1].trim());
    }
}
