package veterinaria.ui;

import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class RegistroCliente extends JFrame {

    private static int clienteIdCounter = 1; // ID inicial de cliente
    private int clienteId;
    private JTextField txtNombre;
    private JTextField txtApellido;
    private JTextField txtTelefono;
    private JTextField txtDireccion;
    private JTextArea txtObservacion;
    private JButton btnGuardarCliente;

    public RegistroCliente() {
        setTitle("Registro de Cliente");
        setSize(400, 400);
        setLayout(null);

        clienteId = clienteIdCounter++; // Asignar ID único y progresivo al cliente

        JLabel lblClienteId = new JLabel("ID Cliente: " + clienteId);
        lblClienteId.setBounds(50, 20, 150, 25);
        add(lblClienteId);

        // Campos de texto para el cliente
        JLabel lblNombre = new JLabel("Nombre:");
        lblNombre.setBounds(50, 50, 80, 25);
        add(lblNombre);

        txtNombre = new JTextField();
        txtNombre.setBounds(150, 50, 180, 25);
        add(txtNombre);

        JLabel lblApellido = new JLabel("Apellido:");
        lblApellido.setBounds(50, 90, 80, 25);
        add(lblApellido);

        txtApellido = new JTextField();
        txtApellido.setBounds(150, 90, 180, 25);
        add(txtApellido);

        JLabel lblTelefono = new JLabel("Teléfono:");
        lblTelefono.setBounds(50, 130, 80, 25);
        add(lblTelefono);

        txtTelefono = new JTextField();
        txtTelefono.setBounds(150, 130, 180, 25);
        add(txtTelefono);

        JLabel lblDireccion = new JLabel("Dirección:");
        lblDireccion.setBounds(50, 170, 80, 25);
        add(lblDireccion);

        txtDireccion = new JTextField();
        txtDireccion.setBounds(150, 170, 180, 25);
        add(txtDireccion);

        JLabel lblObservacion = new JLabel("Observación:");
        lblObservacion.setBounds(50, 210, 80, 25);
        add(lblObservacion);

        txtObservacion = new JTextArea();
        txtObservacion.setBounds(150, 210, 180, 60);
        add(txtObservacion);

        // Botón para guardar cliente y añadir mascotas
        btnGuardarCliente = new JButton("Guardar Cliente y Añadir Mascota");
        btnGuardarCliente.setBounds(100, 300, 200, 30);
        add(btnGuardarCliente);

        btnGuardarCliente.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                guardarCliente();
            }
        });

        // Centrar la ventana
        setLocationRelativeTo(null);
        setVisible(true);
    }

    private void guardarCliente() {
        String nombre = txtNombre.getText();
        String apellido = txtApellido.getText();
        String telefono = txtTelefono.getText();
        String direccion = txtDireccion.getText();
        String observacion = txtObservacion.getText();

        // Aquí se guardaría el cliente en una base de datos o lista (pendiente de implementación)
        JOptionPane.showMessageDialog(this, "Cliente guardado: " + nombre + " " + apellido);

        // Abrir la ventana de registro de mascota
        RegistroMascota registroMascota = new RegistroMascota(clienteId);
        registroMascota.setVisible(true);

        // Cerrar la ventana de registro de cliente
        dispose();
    }
}
