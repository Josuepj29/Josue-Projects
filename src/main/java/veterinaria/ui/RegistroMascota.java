package veterinaria.ui;

import javax.swing.*;

public class RegistroMascota extends JFrame {

    private static int mascotaIdCounter = 1; // ID inicial de mascota
    private int mascotaId;
    private int clienteId; // ID del cliente al que se asociará esta mascota
    private JTextField txtNombreMascota;
    private JTextField txtRaza;
    private JComboBox<String> cbEspecie;
    private JTextField txtEdad;
    private JButton btnGuardarMascota;

    public RegistroMascota(int clienteId) {
        this.clienteId = clienteId;
        setTitle("Registro de Mascota");
        setSize(400, 400);
        setLayout(null);

        mascotaId = mascotaIdCounter++; // Asignar ID único y progresivo a la mascota

        JLabel lblMascotaId = new JLabel("ID Mascota: " + mascotaId);
        lblMascotaId.setBounds(50, 20, 150, 25);
        add(lblMascotaId);

        // Campos de texto para la mascota
        JLabel lblNombreMascota = new JLabel("Nombre:");
        lblNombreMascota.setBounds(50, 50, 80, 25);
        add(lblNombreMascota);

        txtNombreMascota = new JTextField();
        txtNombreMascota.setBounds(150, 50, 180, 25);
        add(txtNombreMascota);

        JLabel lblRaza = new JLabel("Raza:");
        lblRaza.setBounds(50, 90, 80, 25);
        add(lblRaza);

        txtRaza = new JTextField();
        txtRaza.setBounds(150, 90, 180, 25);
        add(txtRaza);

        JLabel lblEspecie = new JLabel("Especie:");
        lblEspecie.setBounds(50, 130, 80, 25);
        add(lblEspecie);

        cbEspecie = new JComboBox<>(new String[] { "Perro", "Gato", "Ave", "Otro" });
        cbEspecie.setBounds(150, 130, 180, 25);
        add(cbEspecie);

        JLabel lblEdad = new JLabel("Edad:");
        lblEdad.setBounds(50, 170, 80, 25);
        add(lblEdad);

        txtEdad = new JTextField();
        txtEdad.setBounds(150, 170, 180, 25);
        add(txtEdad);

        // Botón para guardar mascota
        btnGuardarMascota = new JButton("Guardar Mascota");
        btnGuardarMascota.setBounds(100, 250, 200, 30);
        add(btnGuardarMascota);

        btnGuardarMascota.addActionListener(e -> guardarMascota());

        // Centrar la ventana en la pantalla
        setLocationRelativeTo(null);

        // Mostrar la ventana
        setVisible(true);
    }

    private void guardarMascota() {
        String nombreMascota = txtNombreMascota.getText();
        String raza = txtRaza.getText();
        String especie = (String) cbEspecie.getSelectedItem();
        String edad = txtEdad.getText();

        // Aquí se guardaría la mascota en una base de datos o lista (pendiente de implementación)
        JOptionPane.showMessageDialog(this, "Mascota guardada: " + nombreMascota + " (" + especie + ")");

        // Puedes cerrar la ventana o realizar alguna otra acción según lo necesario
        dispose();
    }
}
